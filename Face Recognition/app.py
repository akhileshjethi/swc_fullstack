"""
Face Recognition System — Streamlit Web Application (V6 - Professional FRMS with Compact Toggle)
=============================================================================
Interactive web interface partitioned by user roles with a dynamic Light/Dark theme:
    - Attendance Portal: View attendance logs & search check-in history.
    - Kiosk Scanner: Webcam & upload-based automatic attendance scanner.
    - Staff Terminal: Enroll user faces and view database stats.
    - Admin Console: Configure thresholds, view security logs, overrides, and delete profiles.
"""

import io
import os
import sys
import time
from datetime import datetime
import pandas as pd

import cv2
import numpy as np
import streamlit as st
from PIL import Image

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from src.recognizer import FaceRecognizer
from src.utils import format_confidence, get_logger

logger = get_logger(__name__)

# ─── Page Configuration ─────────────────────────────────────────────────
st.set_page_config(
    page_title="FRMS — Face Recognition Management System",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Session State Initialization ────────────────────────────────────────
if "logged_in_role" not in st.session_state:
    st.session_state["logged_in_role"] = None
if "logged_in_user" not in st.session_state:
    st.session_state["logged_in_user"] = None
if "login_target_role" not in st.session_state:
    st.session_state["login_target_role"] = None
if "login_error" not in st.session_state:
    st.session_state["login_error"] = None
if "theme" not in st.session_state:
    st.session_state["theme"] = "light"

@st.cache_resource
def load_recognizer():
    """Load the recognizer once and cache it across reruns."""
    return FaceRecognizer()

def get_recognizer():
    """Get the cached recognizer instance."""
    return load_recognizer()

# Define Credentials for Role Access
CREDENTIALS = {
    "student": {"username": "student", "password": "student123", "name": "Attendance Portal"},
    "kiosk": {"username": "kiosk", "password": "kiosk123", "name": "Kiosk Scanner"},
    "staff": {"username": "staff", "password": "staff123", "name": "Staff Terminal"},
    "admin": {"username": "admin", "password": "admin123", "name": "Admin Console"}
}

# ─── Custom CSS Injection ────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    /* Global Styles */
    .stApp {
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc !important;
        color: #0f172a;
    }
    
    /* Hide Streamlit default UI components */
    header[data-testid="stHeader"] {
        display: none !important;
    }
    footer {
        display: none !important;
    }
    [data-testid="stSidebar"] {
        display: none !important;
    }
    
    /* Logo Header Styles */
    .logo-container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 1rem 0;
        background-color: transparent;
    }
    .logo-flex {
        display: flex;
        align-items: center;
        gap: 18px;
    }
    .logo-circle {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border-radius: 50%;
        width: 85px;
        height: 85px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.25);
        color: white;
        font-size: 2.8rem;
        font-weight: 900;
        letter-spacing: -2px;
        line-height: 1;
    }
    .logo-text {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .logo-title {
        font-size: 2.4rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 0.9;
        letter-spacing: -1px;
    }
    .logo-app {
        font-size: 0.75rem;
        font-weight: 700;
        color: #4f46e5;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        margin-top: 3px;
    }
    .logo-desc {
        font-size: 0.65rem;
        font-weight: 600;
        color: #64748b;
        letter-spacing: 1.2px;
        text-transform: uppercase;
    }
    
    /* Portal Grid Layout */
    .portal-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 2.5rem 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 380px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        border-bottom: 6px solid #ffffff;
    }
    .portal-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(79, 70, 229, 0.08);
        border-bottom: 6px solid #4f46e5;
    }
    .portal-icon-container {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        background-color: #f1f5f9;
        border-radius: 12px;
    }
    .portal-icon {
        font-size: 2.4rem;
    }
    .portal-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 0.8rem 0;
        line-height: 1.2;
    }
    .portal-desc {
        font-size: 0.88rem;
        color: #475569;
        line-height: 1.5;
        margin: 0;
        flex-grow: 1;
    }
    
    /* System Health Footer */
    .system-footer {
        background-color: #0f172a;
        color: #f8fafc;
        padding: 2.5rem 4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 6rem;
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.05);
        width: 100vw;
        position: relative;
        left: 50%;
        right: 50%;
        margin-left: -50vw;
        margin-right: -50vw;
    }
    .system-left {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        min-width: 250px;
    }
    .system-label {
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 2px;
        color: #94a3b8;
    }
    .status-grid {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }
    .status-item {
        font-size: 0.9rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #e2e8f0;
    }
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }
    .status-dot.online {
        background-color: #10b981;
        box-shadow: 0 0 8px #10b981;
    }
    .system-divider {
        width: 1px;
        height: 80px;
        background-color: #334155;
        margin: 0 3rem;
    }
    .system-right {
        display: flex;
        justify-content: space-between;
        flex: 1;
        max-width: 900px;
        gap: 2rem;
    }
    .sys-metric {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        flex: 1;
        text-align: center;
    }
    .metric-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    .metric-value {
        font-size: 1.1rem;
        font-weight: 800;
        color: #38bdf8;
    }
    
    /* Portal card login buttons */
    .stButton > button {
        background-color: #4f46e5 !important;
        color: #ffffff !important;
        border-radius: 24px !important;
        border: none !important;
        padding: 0.6rem 2rem !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        margin-top: 1.2rem !important;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
        text-transform: none !important;
    }
    .stButton > button:hover {
        background-color: #4338ca !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3) !important;
    }
    .stButton > button p, .stButton > button span, .stButton > button div {
        color: #ffffff !important;
        font-weight: 700 !important;
    }
    
    /* Result Card Styles */
    .result-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 1.2rem;
        margin: 0.6rem 0;
        border-left: 4px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition: transform 0.2s ease;
    }
    .result-card:hover {
        transform: translateX(4px);
    }
    .result-known {
        border-color: #10b981;
        background: #f0fdf4;
    }
    .result-unknown {
        border-color: #ef4444;
        background: #fdf2f2;
    }
    
    /* Alert Banners */
    .success-banner {
        background: #ecfdf5;
        border-left: 4px solid #10b981;
        border-radius: 4px;
        padding: 1rem;
        color: #065f46;
        font-weight: 500;
    }
    .error-banner {
        background: #fdf2f2;
        border-left: 4px solid #ef4444;
        border-radius: 4px;
        padding: 1rem;
        color: #991b1b;
        font-weight: 500;
    }
    
    /* Make toggle widget compact and aligned */
    div[data-testid="stToggle"] {
        padding-top: 1.8rem;
    }
</style>
""", unsafe_allow_html=True)

# ─── Dark Mode Specific Override CSS ───
if st.session_state["theme"] == "dark":
    st.markdown("""
    <style>
        .stApp {
            background-color: #0f172a !important;
            color: #f8fafc !important;
        }
        .logo-title {
            color: #f8fafc !important;
        }
        .logo-desc {
            color: #94a3b8 !important;
        }
        .portal-card {
            background: #1e293b !important;
            border: 1px solid #334155 !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
        }
        .portal-card:hover {
            box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15) !important;
            border-bottom: 6px solid #6366f1 !important;
        }
        .portal-icon-container {
            background-color: #334155 !important;
        }
        .portal-title {
            color: #f8fafc !important;
        }
        .portal-desc {
            color: #cbd5e1 !important;
        }
        hr {
            border-top: 1px solid #334155 !important;
        }
        
        /* Dark mode inputs and buttons */
        .stButton > button {
            background-color: #6366f1 !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
        }
        .stButton > button:hover {
            background-color: #4f46e5 !important;
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45) !important;
        }
        .stButton > button p, .stButton > button span, .stButton > button div {
            color: #ffffff !important;
            font-weight: 700 !important;
        }
        
        /* Result Card */
        .result-card {
            background: #1e293b !important;
            border-left: 4px solid #475569 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .result-known {
            border-color: #10b981 !important;
            background: #064e3b !important;
            color: #ecfdf5 !important;
        }
        .result-unknown {
            border-color: #ef4444 !important;
            background: #7f1d1d !important;
            color: #fdf2f2 !important;
        }
        
        /* Form titles and metric texts in dark mode */
        h1, h2, h3, h4, h5, h6, p, span, strong, label {
            color: #f8fafc !important;
        }
        
        /* Override Streamlit UI components in Dark Mode to match */
        div[data-baseweb="input"] input {
            color: #f8fafc !important;
            background-color: #1e293b !important;
            border-color: #334155 !important;
        }
        div[data-baseweb="select"] > div {
            background-color: #1e293b !important;
            color: #f8fafc !important;
        }
        div[role="listbox"] {
            background-color: #1e293b !important;
        }
        
        /* Tab styling */
        div[data-testid="stTabs"] button {
            color: #94a3b8 !important;
        }
        div[data-testid="stTabs"] button[aria-selected="true"] {
            color: #6366f1 !important;
            border-color: #6366f1 !important;
        }
        
        /* Metric styling */
        div[data-testid="stMetricValue"] {
            color: #f8fafc !important;
        }
        div[data-testid="stMetricLabel"] {
            color: #94a3b8 !important;
        }
    </style>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <style>
        h1, h2, h3, h4, h5, h6, p, span, strong, label {
            color: #0f172a;
        }
        div[data-testid="stTabs"] button {
            color: #475569 !important;
        }
        div[data-testid="stTabs"] button[aria-selected="true"] {
            color: #4f46e5 !important;
            border-color: #4f46e5 !important;
        }
    </style>
    """, unsafe_allow_html=True)


# ─── Portal Routing ──────────────────────────────────────────────────────

# Case 1: Not Logged In, and No Target Login Screen Chosen -> Show Landing Hub
if st.session_state["logged_in_role"] is None and st.session_state["login_target_role"] is None:
    recognizer = get_recognizer()
    stats = recognizer.get_database_stats()
    
    # ─── Header with Compact Theme Switcher ───
    logo_col1, logo_col2 = st.columns([10, 1])
    with logo_col1:
        st.markdown("""
        <div class="logo-container">
            <div class="logo-flex">
                <div class="logo-circle">🎛️</div>
                <div class="logo-text">
                    <span class="logo-title">FRMS</span>
                    <span class="logo-app">Face Recognition Management System</span>
                    <span class="logo-desc">Unified Multi-Role Attendance Platform</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with logo_col2:
        dark_mode = st.toggle("Dark Mode", value=(st.session_state["theme"] == "dark"), key="theme_toggle_landing")
        if dark_mode != (st.session_state["theme"] == "dark"):
            st.session_state["theme"] = "dark" if dark_mode else "light"
            st.rerun()
                
    st.markdown("<hr style='border: none; border-top: 1px solid #e2e8f0; margin-bottom: 3rem; margin-top: 1rem;'>", unsafe_allow_html=True)
    
    # ─── Grid of 4 Portal Cards ───
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="portal-card">
            <div class="portal-icon-container">
                <span class="portal-icon">📋</span>
            </div>
            <h3 class="portal-title">Attendance Portal</h3>
            <p class="portal-desc">Access view-only logs, verify daily check-ins, filter records by date range, search attendance history, and export verified records.</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Portal", key="portal_btn_student", use_container_width=True):
            st.session_state["login_target_role"] = "student"
            st.session_state["login_error"] = None
            st.rerun()
            
    with col2:
        st.markdown("""
        <div class="portal-card">
            <div class="portal-icon-container">
                <span class="portal-icon">📷</span>
            </div>
            <h3 class="portal-title">Kiosk Scanner</h3>
            <p class="portal-desc">Launch the face verification scanner terminal. Designed for tablets or entrance terminals to capture frames and automatically record check-ins.</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Scanner", key="portal_btn_kiosk", use_container_width=True):
            st.session_state["login_target_role"] = "kiosk"
            st.session_state["login_error"] = None
            st.rerun()
            
    with col3:
        st.markdown("""
        <div class="portal-card">
            <div class="portal-icon-container">
                <span class="portal-icon">👩‍💻</span>
            </div>
            <h3 class="portal-title">Staff Terminal</h3>
            <p class="portal-desc">Register new student/employee faces. Upload image sets, execute augmentations, assess quality checkpoints, and review database profiles.</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Terminal", key="portal_btn_staff", use_container_width=True):
            st.session_state["login_target_role"] = "staff"
            st.session_state["login_error"] = None
            st.rerun()
            
    with col4:
        st.markdown("""
        <div class="portal-card">
            <div class="portal-icon-container">
                <span class="portal-icon">⚙️</span>
            </div>
            <h3 class="portal-title">Admin Console</h3>
            <p class="portal-desc">Manage core settings, tune thresholds, audit anti-spoof alarms, log manual attendance overrides, export SQLite database data, and manage entries.</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Console", key="portal_btn_admin", use_container_width=True):
            st.session_state["login_target_role"] = "admin"
            st.session_state["login_error"] = None
            st.rerun()
            
    # ─── System Health Footer ───
    st.markdown(f"""
    <div class="system-footer">
        <div class="system-left">
            <div class="system-label">SYSTEM HEALTH STATUS</div>
            <div class="status-grid">
                <div class="status-item"><span class="status-dot online"></span> Detector: MTCNN</div>
                <div class="status-item"><span class="status-dot online"></span> Encoder: FaceNet</div>
                <div class="status-item"><span class="status-dot online"></span> DB: SQLite</div>
            </div>
        </div>
        <div class="system-divider"></div>
        <div class="system-right">
            <div class="sys-metric">
                <div class="metric-label">RUNNING ON</div>
                <div class="metric-value">{config.DEVICE.upper()}</div>
            </div>
            <div class="sys-metric">
                <div class="metric-label">ANTI-SPOOFING</div>
                <div class="metric-value">{'ENABLED' if config.ANTI_SPOOF_ENABLED else 'DISABLED'}</div>
            </div>
            <div class="sys-metric">
                <div class="metric-label">QUALITY FILTER</div>
                <div class="metric-value">{'ENABLED' if config.QUALITY_CHECK_ENABLED else 'DISABLED'}</div>
            </div>
            <div class="sys-metric">
                <div class="metric-label">ACTIVE PROFILES</div>
                <div class="metric-value">{stats['total_persons']}</div>
            </div>
            <div class="sys-metric">
                <div class="metric-label">TOTAL EMBEDDINGS</div>
                <div class="metric-value">{stats['total_embeddings']}</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# Case 2: Target Login Screen is Selected -> Show Login Form
elif st.session_state["logged_in_role"] is None and st.session_state["login_target_role"] is not None:
    role = st.session_state["login_target_role"]
    role_info = CREDENTIALS[role]
    
    # ─── Header with Compact Theme Switcher ───
    logo_col1, logo_col2 = st.columns([10, 1])
    with logo_col1:
        st.markdown("""
        <div style="display: flex; justify-content: flex-start; align-items: center; padding: 1rem 0; background-color: transparent;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.6rem; font-weight: 900;">🎛️</div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 1.4rem; font-weight: 800; line-height: 1;">FRMS</span>
                    <span style="font-size: 0.55rem; font-weight: 700; color: #4f46e5; letter-spacing: 1.5px; text-transform: uppercase;">Face Recognition Platform</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with logo_col2:
        dark_mode = st.toggle("Dark Mode", value=(st.session_state["theme"] == "dark"), key="theme_toggle_login")
        if dark_mode != (st.session_state["theme"] == "dark"):
            st.session_state["theme"] = "dark" if dark_mode else "light"
            st.rerun()
                
    st.markdown("<hr style='border: none; border-top: 1px solid #e2e8f0; margin-bottom: 2rem;'>", unsafe_allow_html=True)
    
    col_l1, col_l2, col_l3 = st.columns([1, 2, 1])
    with col_l2:
        # Styled Card Box
        card_bg = "#ffffff" if st.session_state["theme"] == "light" else "#1e293b"
        card_border = "#e2e8f0" if st.session_state["theme"] == "light" else "#334155"
        st.markdown(f"""
        <div style="background: {card_bg}; border: 1px solid {card_border}; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.02); margin-bottom: 2rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.4rem; font-weight: 800; text-align: center;">{role_info['name']}</h3>
            <p style="margin: 0 0 1.5rem 0; font-size: 0.85rem; color: #64748b; text-align: center;">Access is restricted. Please sign in with authorized credentials.</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Form Container
        username = st.text_input("Username / Employee Code", key="login_username_input", placeholder=f"Enter '{role}' to log in...")
        password = st.text_input("Password", type="password", key="login_password_input", placeholder=f"Enter password (e.g. '{role}123')...")
        
        if st.session_state.get("login_error"):
            st.error(st.session_state["login_error"])
            
        st.markdown("<br>", unsafe_allow_html=True)
        
        btn_col1, btn_col2 = st.columns(2)
        with btn_col1:
            if st.button("Sign In", type="primary", key="login_submit_btn", use_container_width=True):
                if username == role_info["username"] and password == role_info["password"]:
                    st.session_state["logged_in_role"] = role
                    st.session_state["logged_in_user"] = username
                    st.session_state["login_target_role"] = None
                    st.session_state["login_error"] = None
                    st.rerun()
                else:
                    st.session_state["login_error"] = f"Invalid username or password. (Hint: username is '{role}', password is '{role}123')"
                    st.rerun()
        with btn_col2:
            if st.button("Back to Portal Hub", key="login_back_btn", use_container_width=True):
                st.session_state["login_target_role"] = None
                st.session_state["login_error"] = None
                st.rerun()


# Case 3: Logged In -> Show Respective Role Portal Page
else:
    role = st.session_state["logged_in_role"]
    username = st.session_state["logged_in_user"]
    recognizer = get_recognizer()
    
    # ─── Navigation Header with Compact Toggle ───
    nav_col1, nav_col2, nav_col3, nav_col4 = st.columns([5, 4, 1.5, 1.5])
    with nav_col1:
        st.markdown("""
        <div style="display: flex; align-items: center; gap: 8px; padding-top: 5px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.3rem; font-weight: 900;">🎛️</div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-size: 1.3rem; font-weight: 800; line-height: 1;">FRMS</span>
                <span style="font-size: 0.6rem; font-weight: 700; color: #4f46e5; letter-spacing: 0.5px; text-transform: uppercase;">Face Recognition System</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
    with nav_col2:
        role_name = CREDENTIALS[role]["name"]
        st.markdown(f"""
        <div style="text-align: right; padding-top: 10px;">
            <span style="font-size: 0.95rem; color: #475569;">Console Interface: <strong style="color: #4f46e5;">{role_name}</strong> ({username})</span>
        </div>
        """, unsafe_allow_html=True)
    with nav_col3:
        dark_mode = st.toggle("Dark Mode", value=(st.session_state["theme"] == "dark"), key="theme_toggle_portal")
        if dark_mode != (st.session_state["theme"] == "dark"):
            st.session_state["theme"] = "dark" if dark_mode else "light"
            st.rerun()
    with nav_col4:
        if st.button("Exit Portal", key="top_logout_btn", use_container_width=True):
            st.session_state["logged_in_role"] = None
            st.session_state["logged_in_user"] = None
            st.session_state["login_target_role"] = None
            st.rerun()
            
    st.markdown("<hr style='margin: 0.5rem 0 1.5rem 0; border: none; border-top: 1px solid #e2e8f0;'>", unsafe_allow_html=True)
    
    # ─── RENDERING ROLE PORTALS ───
    
    # ─── 1. Attendance Portal ───
    if role == "student":
        st.markdown("### 📅 Live Attendance Logs & Reports")
        st.markdown("Monitor checked-in users and search the system database.")
        
        col_stats1, col_stats2 = st.columns(2)
        with col_stats1:
            today_records = recognizer.attendance.get_today_attendance()
            st.metric("Total Check-ins Today", len(today_records))
        with col_stats2:
            stats = recognizer.get_database_stats()
            st.metric("Registered System Profiles", stats["total_persons"])
            
        st.markdown("---")
        
        # Search Box
        st.markdown("#### 🔍 Search Attendance History")
        search_name = st.text_input("Enter Profile Name to search", placeholder="e.g. Akhilesh")
        
        if search_name:
            history = recognizer.attendance.get_person_attendance_history(search_name, days=30)
            if history:
                hist_df = pd.DataFrame(history)
                hist_df.columns = ["Timestamp", "Confidence", "Notes"]
                hist_df["Confidence"] = hist_df["Confidence"].apply(format_confidence)
                st.success(f"Found {len(history)} records for '{search_name}' in the last 30 days:")
                st.dataframe(hist_df, use_container_width=True)
            else:
                st.warning(f"No records found for profile '{search_name}' in the last 30 days.")
        else:
            st.markdown("#### 📋 Today's Check-in Log")
            if today_records:
                today_df = pd.DataFrame(today_records)
                today_df.columns = ["Name", "Time", "Confidence", "Notes"]
                today_df["Confidence"] = today_df["Confidence"].apply(format_confidence)
                st.dataframe(today_df, use_container_width=True)
            else:
                st.info("No attendance logged today yet.")
                
    # ─── 2. Kiosk Scanner ───
    elif role == "kiosk":
        st.markdown("### 📹 Live Entrance Check-in Kiosk")
        st.markdown("Stand in front of the camera to automatically log attendance, or upload a frame.")
        
        col_kiosk1, col_kiosk2 = st.columns([2, 1])
        
        with col_kiosk2:
            st.markdown("#### ⚙️ Terminal Specs")
            st.markdown(f"""
            - **Computing Node:** `{config.DEVICE.upper()}`
            - **Spoofing Guard:** `{'ENABLED' if config.ANTI_SPOOF_ENABLED else 'DISABLED'}`
            - **Quality Threshold:** `{'ENABLED' if config.QUALITY_CHECK_ENABLED else 'DISABLED'} (Score: {config.MIN_FACE_QUALITY_SCORE})`
            """)
            
            st.markdown("---")
            st.markdown("#### 📋 Latest Successful Check-ins")
            today_records = recognizer.attendance.get_today_attendance()
            if today_records:
                for record in today_records[:4]:
                    st.markdown(f"""
                    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 0.5rem 1rem; border-radius: 0 8px 8px 0; margin-bottom: 0.5rem;">
                        <strong style="color: #0f766e;">{record['name']}</strong><br>
                        <span style="font-size: 0.8rem; color: #115e59;">Checked in at {record['time']}</span>
                    </div>
                    """, unsafe_allow_html=True)
            else:
                st.info("No active check-ins logged today.")
                
        with col_kiosk1:
            camera_image = st.camera_input("📷 Position your face in the camera frame")
            
            uploaded = st.file_uploader(
                "Or Upload a Snapshot Frame",
                type=["jpg", "jpeg", "png", "bmp", "webp"],
                help="Upload a face photo if webcam is unavailable."
            )
            
            target_image = None
            if camera_image:
                target_image = Image.open(camera_image).convert("RGB")
            elif uploaded:
                target_image = Image.open(uploaded).convert("RGB")
                
            if target_image:
                with st.spinner("🔍 Processing frame scanning..."):
                    results = recognizer.recognize(target_image)
                    
                if results:
                    img_array = np.array(target_image)
                    for result in results:
                        box = result["box"]
                        x1, y1, x2, y2 = [int(c) for c in box]
                        
                        if result["is_known"]:
                            color = (16, 185, 129)  # Green
                            label = f"{result['name']} ({format_confidence(result['confidence'])})"
                            
                            # Mark Attendance
                            att_res = recognizer.attendance.mark_attendance(result["name"], confidence=result["confidence"])
                            if att_res["success"]:
                                st.success(f"✅ Welcome {result['name']}! Your check-in has been registered.")
                            else:
                                st.info(f"ℹ️ {att_res['message']}")
                        else:
                            color = (239, 68, 68)  # Red
                            label = f"Unknown ({format_confidence(result['confidence'])})"
                            st.error("⚠️ Face not recognized. Please retry or verify profile registration.")
                            
                        cv2.rectangle(img_array, (x1, y1), (x2, y2), color, 3)
                        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                        cv2.rectangle(img_array, (x1, y1 - th - 14), (x1 + tw + 10, y1), color, -1)
                        cv2.putText(img_array, label, (x1 + 5, y1 - 7),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                                   
                    st.image(img_array, caption="Camera Stream Output", use_container_width=True)
                else:
                    st.warning("No face detected. Align your face in the camera indicator block.")
                    
    # ─── 3. Staff Terminal ───
    elif role == "staff":
        st.markdown("### 👩‍💻 Staff User Enrollment Terminal")
        st.markdown("Add profiles to the database and audit registered assets.")
        
        tab_register, tab_database = st.tabs(["📸 Register Face", "📋 Profile Database"])
        
        with tab_register:
            st.markdown("#### Enroll a New Profile")
            st.markdown("Upload clean, frontal face photographs of the subject.")
            
            col_reg1, col_reg2 = st.columns([1, 1])
            with col_reg1:
                person_name = st.text_input(
                    "Profile Name",
                    placeholder="Enter full name...",
                    key="staff_person_name"
                )
                enable_augmentation = st.checkbox(
                    "Enable Image Augmentation",
                    value=True,
                    help="Automatically generates augmented samples to improve detection recall in bad lighting."
                )
                uploaded_files = st.file_uploader(
                    "Upload Photo Sets",
                    type=["jpg", "jpeg", "png", "bmp", "webp"],
                    accept_multiple_files=True,
                    help="Upload clear photos of the person's face."
                )
            with col_reg2:
                if uploaded_files:
                    st.markdown("##### Upload Preview")
                    preview_cols = st.columns(min(len(uploaded_files), 3))
                    for i, file in enumerate(uploaded_files[:3]):
                        with preview_cols[i]:
                            img = Image.open(file)
                            st.image(img, caption=file.name, use_container_width=True)
                            
            if st.button("🚀 Enroll Profile Face", type="primary", key="staff_reg_btn", disabled=not (person_name and uploaded_files)):
                with st.spinner(f"Registering '{person_name}'..."):
                    total_embeddings = 0
                    success = True
                    progress = st.progress(0)
                    
                    for i, file in enumerate(uploaded_files):
                        image = Image.open(file).convert("RGB")
                        result = recognizer.register_face(
                            name=person_name,
                            image=image,
                            augment=enable_augmentation
                        )
                        progress.progress((i + 1) / len(uploaded_files))
                        
                        if result["success"]:
                            total_embeddings += result["embeddings_stored"]
                        else:
                            st.error(f"{file.name}: {result['message']}")
                            success = False
                            
                    progress.empty()
                    if total_embeddings > 0:
                        st.success(f"✅ Successfully enrolled profile '{person_name}' with {total_embeddings} embedding vectors!")
                        st.balloons()
                        time.sleep(1)
                        st.rerun()
                        
        with tab_database:
            st.markdown("#### Profile Database")
            stats = recognizer.get_database_stats()
            
            col_db1, col_db2 = st.columns(2)
            col_db1.metric("Registered Profiles", stats["total_persons"])
            col_db2.metric("Total Vector Embeddings", stats["total_embeddings"])
            
            st.markdown("---")
            if stats["persons"]:
                for person in stats["persons"]:
                    # Adjust box styling dynamically
                    box_bg = "#ffffff" if st.session_state["theme"] == "light" else "#1e293b"
                    box_border = "#e2e8f0" if st.session_state["theme"] == "light" else "#334155"
                    st.markdown(f"""
                    <div style="background-color: {box_bg}; border: 1px solid {box_border}; border-radius: 8px; padding: 0.8rem 1.2rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                        <span style="font-weight: 600;">👤 {person['name']}</span>
                        <span style="font-size: 0.9rem;">{person['embeddings']} active embeddings</span>
                    </div>
                    """, unsafe_allow_html=True)
            else:
                st.info("No profile records available. Register new faces to add profiles.")
                
    # ─── 4. Admin Console ───
    elif role == "admin":
        st.markdown("### 🛡️ System Control & Admin Console")
        st.markdown("Manage system settings, log manual overrides, handle profiles, and audit security logs.")
        
        admin_tab_dashboard, admin_tab_override, admin_tab_settings, admin_tab_db = st.tabs([
            "📊 Health & Analytics",
            "📅 Manual Override",
            "⚙️ Adjust Thresholds",
            "📋 Database Administration"
        ])
        
        stats = recognizer.get_database_stats()
        
        with admin_tab_dashboard:
            # Stats row
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Total Database Profiles", stats["total_persons"])
            with col2:
                st.metric("Total Face Signatures", stats["total_embeddings"])
            with col3:
                st.metric("Detection Threshold", format_confidence(config.RECOGNITION_THRESHOLD))
            with col4:
                st.metric("Computing Device", config.DEVICE.upper())
                
            st.markdown("<br>", unsafe_allow_html=True)
            col_left, col_right = st.columns([3, 2])
            
            with col_left:
                st.markdown("#### Weekly Check-in Velocity")
                tracker = recognizer.attendance
                stats_7d = tracker.get_attendance_stats(days=7)
                daily_breakdown = stats_7d["daily_breakdown"]
                if daily_breakdown:
                    chart_df = pd.DataFrame(daily_breakdown)
                    chart_df.columns = ["Date", "Total Marks", "Unique Persons"]
                    chart_df.set_index("Date", inplace=True)
                    st.bar_chart(chart_df[["Unique Persons", "Total Marks"]])
                else:
                    st.info("No verification activity in the last 7 days.")
                    
            with col_right:
                st.markdown("#### Security Alarms (Liveness Audit)")
                spoof_count = stats_7d['spoof_attempts']
                if spoof_count > 0:
                    st.markdown(f"""
                    <div class="error-banner" style="margin-bottom: 1rem;">
                        ⚠️ <strong>Liveness Alert:</strong> Intercepted {spoof_count} validation/spoofing attacks (photo/screen replay) in the last 7 days!
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown("""
                    <div class="success-banner" style="margin-bottom: 1rem;">
                        🛡️ Liveness auditor reporting normal status. No spoofing signatures recorded.
                    </div>
                    """, unsafe_allow_html=True)
                    
                st.markdown(f"""
                - **Anti-Spoofing checks:** `{'ENABLED' if config.ANTI_SPOOF_ENABLED else 'DISABLED'}`
                - **Blur/Contrast quality filters:** `{'ENABLED' if config.QUALITY_CHECK_ENABLED else 'DISABLED'}` (Limit: {config.MIN_FACE_QUALITY_SCORE})
                - **Matching Strategy:** `{config.MATCHING_STRATEGY.replace('_', ' ').title()}`
                """)
                
        with admin_tab_override:
            st.markdown("#### Manual Check-in Override")
            st.markdown("Force mark a profile check-in when face authentication is unavailable.")
            registered_names = recognizer.get_registered_persons()
            if registered_names:
                manual_name = st.selectbox("Select Target Profile", registered_names, key="admin_manual_selectbox")
                manual_notes = st.text_input("Override Authorization Notes", placeholder="e.g. Card malfunctioning, manual verification", key="admin_manual_notes_input")
                if st.button("Mark Present Manually", type="primary", key="admin_manual_submit_btn"):
                    result = recognizer.attendance.mark_attendance(manual_name, confidence=1.0, notes=manual_notes)
                    if result["success"]:
                        st.success(result["message"])
                        st.rerun()
                    else:
                        st.warning(result["message"])
            else:
                st.info("No database profiles available.")
                
        with admin_tab_settings:
            st.markdown("#### Tunable Threshold & Distance Settings")
            threshold = st.slider(
                "Face Matching Confidence Threshold (Cosine)",
                min_value=0.50, max_value=0.99,
                value=config.RECOGNITION_THRESHOLD,
                step=0.01,
                help="Increasing the threshold makes verification stricter, reducing false acceptance rates."
            )
            config.RECOGNITION_THRESHOLD = threshold
            
            distance_metric = st.selectbox(
                "Distance Metric Logic",
                ["cosine", "euclidean"],
                index=0 if config.DISTANCE_METRIC == "cosine" else 1
            )
            config.DISTANCE_METRIC = distance_metric
            
            st.success("Configuration modifications saved successfully!")
            
        with admin_tab_db:
            st.markdown("#### Profile & Database Audit")
            
            if stats["persons"]:
                csv_filename = f"attendance_history_{datetime.now().strftime('%Y-%m-%d')}.csv"
                csv_filepath = os.path.join(config.DATA_DIR, csv_filename)
                recognizer.attendance.export_csv(csv_filepath, days=30)
                
                with open(csv_filepath, "rb") as file:
                    st.download_button(
                        label="📥 Export Last 30 Days logs (CSV)",
                        data=file,
                        file_name=csv_filename,
                        mime="text/csv",
                        key="admin_csv_export_btn"
                    )
                    
                st.markdown("---")
                st.markdown("##### Enrolled Profiles List")
                for person in stats["persons"]:
                    col_name, col_count, col_del = st.columns([3, 1, 1])
                    with col_name:
                        st.markdown(f"**👤 {person['name']}**")
                    with col_count:
                        st.markdown(f"*{person['embeddings']} embeddings stored*")
                    with col_del:
                        if st.button(f"🗑️ Delete", key=f"admin_delete_profile_{person['name']}"):
                            recognizer.delete_person(person['name'])
                            st.success(f"Successfully deleted profile '{person['name']}'")
                            time.sleep(0.5)
                            st.rerun()
                            
                st.markdown("---")
                with st.expander("⚠️ Danger Zone"):
                    st.warning("Warning: Wiping the database removes all registered profiles and signature templates. This cannot be undone.")
                    if st.button("🗑️ Clear Entire Database", type="secondary", key="admin_clear_db_action_btn"):
                        count = recognizer.database.clear_database()
                        st.error(f"Cleared database: deleted {count} records.")
                        time.sleep(1)
                        st.rerun()
            else:
                st.info("No enrolled profiles found in database.")
