import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Image as ImageIcon, LogOut, Search, Users, CalendarHeart, PhoneCall, Trash2, Edit, X, Plus, UploadCloud, MonitorPlay, CheckCircle, Menu, MessageSquare, Sparkles, Star, User, Download, Gift, Bell, TrendingUp, BarChart3, PieChart, MapPin, Filter, ArrowDownUp, Mail, Clock, Megaphone } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", phone: "", email: "", address: "", eventDate: "", eventType: "", guests: "", message: "", status: "Pending" });
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const prevEnquiryCount = useRef(0);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Events States
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventData, setEventData] = useState({ id: "", title: "", image: "", category: "", file: null });

  // Gallery States
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoData, setPhotoData] = useState({ title: "", category: "", file: null });

  // Hero States
  const [heroSlides, setHeroSlides] = useState([]);
  const [loadingHero, setLoadingHero] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroData, setHeroData] = useState({ id: "", title: "", subtitle: "", type: "image", page: "home", url: "", file: null });

  // Amenities States
  const [amenities, setAmenities] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [amenityData, setAmenityData] = useState({ id: "", title: "", description: "", image: "", file: null });

  // Testimonials States
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialData, setTestimonialData] = useState({ id: "", name: "", role: "", message: "", rating: 5, image: "", file: null });

  // Packages States
  const [packagesData, setPackagesData] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({ id: "", category: "💍 Wedding", title: "", price: "", description: "", featured: false });

  // Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState({ id: "", text: "", isActive: true });

  // ================= UTILITY: DATE FORMATTER =================
  const formatEventDate = (dateStr) => {
    if (!dateStr) return "";
    const p = dateStr.split("-");
    if (p.length === 3 && p[0].length === 4) return `${p[2]}-${p[1]}-${p[0]}`; // Convert YYYY-MM-DD to DD-MM-YYYY
    return dateStr;
  };

  // ================= TOAST / SMS NOTIFICATION =================
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Security: Agar token nahi hai toh Login pe bhej do
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (activeMenu === "dashboard" || activeMenu === "enquiries" || activeMenu === "contacts") {
      fetchEnquiries(token);
    } else if (activeMenu === "events") {
      fetchEvents();
    } else if (activeMenu === "gallery") {
      fetchPhotos();
    } else if (activeMenu === "hero") {
      fetchHero();
    } else if (activeMenu === "amenities") {
      fetchAmenities();
    } else if (activeMenu === "testimonials") {
      fetchTestimonials();
    } else if (activeMenu === "packages") {
      fetchPackages();
    } else if (activeMenu === "announcements") {
      fetchAnnouncements();
    }
  }, [navigate, activeMenu]);

  const fetchEnquiries = async (token, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Check for new bookings to trigger pop-up
        if (prevEnquiryCount.current > 0 && data.data.length > prevEnquiryCount.current) {
          const newCount = data.data.length - prevEnquiryCount.current;
          showToast(`🔔 ${newCount} New Enquiry Received!`);
        }
        setEnquiries(data.data);
        prevEnquiryCount.current = data.data.length;
      }
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // ================= REAL-TIME POLLING =================
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    // Fetch once silently for notifications globally
    fetchEnquiries(token, true);

    // Har 15 second mein backend se naya data check karega bina page load kiye
    const interval = setInterval(() => {
      fetchEnquiries(token, true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Remove deleted enquiry from UI without reloading
        setEnquiries(enquiries.filter(enq => enq._id !== id));
        showToast("Enquiry Deleted Successfully!");
      } else showToast("❌ " + (data.message || "Failed to delete"));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const openEditModal = (enq) => {
    setEditData({
      id: enq._id,
      name: enq.name,
      phone: enq.phone,
      email: enq.email,
      address: enq.address || "",
      eventDate: formatEventDate(enq.eventDate),
      eventType: enq.eventType,
      guests: enq.guests,
      message: enq.message || "",
      status: enq.status || "Pending",
    });
    setIsEditModalOpen(true);
  };

  // ================= DOWNLOAD CSV LOGIC =================
  const downloadEnquiriesCSV = () => {
    if (enquiries.length === 0) {
      showToast("❌ No data to download");
      return;
    }

    const dataToExport = filteredAndSortedEnquiries;
    const headers = ["Client Name", "Phone", "Email", "Address", "Event Date", "Event Type", "Guests", "Message", "Received On (DD/MM/YYYY)"];
    
    const rows = dataToExport.map(enq => [
      `"${enq.name || ""}"`,
      `"${enq.phone || ""}"`,
      `"${enq.email || ""}"`,
      `"${enq.address || ""}"`,
      `"${formatEventDate(enq.eventDate)}"`,
      `"${enq.eventType || ""}"`,
      `"${enq.guests || ""}"`,
      `"${(enq.message || "").replace(/"/g, '""')}"`,
      `"${new Date(enq.createdAt).toLocaleDateString('en-GB')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Arya_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(enquiries.map((enq) => (enq._id === editData.id ? data.data : enq)));
        setIsEditModalOpen(false);
        showToast("Enquiry Updated Successfully!");
      } else showToast("❌ " + (data.message || "Failed to update"));
    } catch (err) { console.error("Update Error:", err); } 
    finally { setUpdating(false); }
  };

  // ================= QUICK CONFIRM LOGIC =================
  const handleQuickConfirm = async (enq) => {
    if (!window.confirm(`Are you sure you want to CONFIRM the booking for ${enq.name}?`)) return;
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${enq._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...enq, status: "Confirmed" }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(enquiries.map((e) => (e._id === enq._id ? data.data : e)));
        if (isViewModalOpen) setViewData(data.data); // Update Modal live
        showToast("Booking Confirmed! ✅ WhatsApp SMS button is now active.");
      } else showToast("❌ " + (data.message || "Failed to confirm"));
    } catch (err) { console.error("Confirm Error:", err); }
    finally { setUpdating(false); }
  };

  // ================= EVENTS CRUD LOGIC =================
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("http://localhost:5000/api/events");
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch (err) { console.error("Fetch Events Error:", err); } 
    finally { setLoadingEvents(false); }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const url = eventData.id ? `http://localhost:5000/api/events/${eventData.id}` : "http://localhost:5000/api/events/create";
    const method = eventData.id ? "PUT" : "POST";
    
    const formData = new FormData();
    formData.append("title", eventData.title);
    formData.append("category", eventData.category);
    if (eventData.file) formData.append("image", eventData.file);
    else if (eventData.image) formData.append("image", eventData.image); // Retain old image link during edit

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }, // FormData automatically sets multipart boundaries
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
        setIsEventModalOpen(false);
        showToast("Event Saved Successfully!");
      } else showToast("❌ " + (data.message || "Failed to save event"));
    } catch (err) { console.error("Event Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { 
        setEvents(events.filter(e => e._id !== id)); 
        showToast("Event Deleted!"); 
      }
    } catch (err) { console.error("Event Delete Error:", err); }
  };

  const openEventModal = (ev = null) => {
    if (ev) setEventData({ id: ev._id, title: ev.title, image: ev.image, category: ev.category, file: null });
    else setEventData({ id: "", title: "", image: "", category: "", file: null });
    setIsEventModalOpen(true);
  };

  // ================= GALLERY CRUD LOGIC =================
  const fetchPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const res = await fetch("http://localhost:5000/api/gallery");
      const data = await res.json();
      if (data.success) setPhotos(data.data);
    } catch (err) { console.error("Fetch Photos Error:", err); } 
    finally { setLoadingPhotos(false); }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoData.file) return alert("Please select an image file");
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    
    const formData = new FormData();
    formData.append("image", photoData.file);
    formData.append("title", photoData.title);
    formData.append("category", photoData.category);

    try {
      const res = await fetch("http://localhost:5000/api/gallery/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // FormData me Content-Type nahi dete, browser khud handle karta hai
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchPhotos();
        setIsPhotoModalOpen(false);
        showToast("Photo Uploaded Successfully!");
      } else showToast("❌ " + (data.message || "Failed to upload photo"));
    } catch (err) { console.error("Photo Upload Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/gallery/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { 
        setPhotos(photos.filter(p => p._id !== id)); 
        showToast("Photo Deleted!"); 
      }
    } catch (err) { console.error("Photo Delete Error:", err); }
  };

  const openPhotoModal = () => {
    setPhotoData({ title: "", category: "", file: null });
    setIsPhotoModalOpen(true);
  };

  // ================= HERO CRUD LOGIC =================
  const fetchHero = async () => {
    setLoadingHero(true);
    try {
      const res = await fetch("http://localhost:5000/api/hero");
      const data = await res.json();
      if (data.success) setHeroSlides(data.data);
    } catch (err) { console.error("Fetch Hero Error:", err); } 
    finally { setLoadingHero(false); }
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    if (heroData.file) formData.append("media", heroData.file);
    formData.append("title", heroData.title);
    formData.append("subtitle", heroData.subtitle);
    formData.append("type", heroData.type);
    formData.append("page", heroData.page);
    if (heroData.url) formData.append("url", heroData.url); // Preserve old URL if no new file is selected

    // SMART OVERWRITE: Agar home page nahi hai aur naya slide bana rahe hain, toh purane wale ko hatakar (replace karke) naya lagayein
    let submitId = heroData.id;
    if (heroData.page !== "home" && !submitId) {
      const existingSlide = heroSlides.find(s => s.page === heroData.page);
      if (existingSlide) {
        submitId = existingSlide._id; // Override existing slide for this page
      }
    }

    const url = submitId ? `http://localhost:5000/api/hero/${submitId}` : "http://localhost:5000/api/hero/create";
    try {
      const res = await fetch(url, { method: submitId ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (data.success) { 
        fetchHero(); 
        setIsHeroModalOpen(false); 
        showToast("Hero Slide Saved Successfully!"); 
      } else showToast("❌ " + (data.message || "Failed to save"));
    } catch (err) { console.error("Hero Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/hero/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { 
        setHeroSlides(heroSlides.filter(s => s._id !== id)); 
        showToast("Slide Deleted!"); 
      }
    } catch (err) { console.error("Hero Delete Error:", err); }
  };

  const openHeroModal = (slide = null) => {
    if (slide) setHeroData({ id: slide._id, title: slide.title, subtitle: slide.subtitle, type: slide.type, page: slide.page || "home", url: slide.url, file: null });
    else setHeroData({ id: "", title: "", subtitle: "", type: "image", page: "home", url: "", file: null });
    setIsHeroModalOpen(true);
  };

  // ================= AMENITIES CRUD LOGIC =================
  const fetchAmenities = async () => {
    setLoadingAmenities(true);
    try {
      const res = await fetch("http://localhost:5000/api/amenities");
      const data = await res.json();
      if (data.success) setAmenities(data.data);
    } catch (err) { console.error("Fetch Amenities Error:", err); }
    finally { setLoadingAmenities(false); }
  };

  const handleAmenitySubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const url = amenityData.id ? `http://localhost:5000/api/amenities/${amenityData.id}` : "http://localhost:5000/api/amenities/create";
    const formData = new FormData();
    formData.append("title", amenityData.title);
    formData.append("description", amenityData.description);
    if (amenityData.file) formData.append("image", amenityData.file);
    else if (amenityData.image) formData.append("image", amenityData.image);

    try {
      const res = await fetch(url, { method: amenityData.id ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (data.success) { fetchAmenities(); setIsAmenityModalOpen(false); showToast("Amenity Saved Successfully!"); } else showToast("❌ " + (data.message || "Failed to save"));
    } catch (err) { console.error("Amenity Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeleteAmenity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this amenity?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/amenities/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setAmenities(amenities.filter(a => a._id !== id)); showToast("Amenity Deleted!"); }
    } catch (err) { console.error("Amenity Delete Error:", err); }
  };

  const openAmenityModal = (am = null) => {
    if (am) setAmenityData({ id: am._id, title: am.title, description: am.description, image: am.image, file: null });
    else setAmenityData({ id: "", title: "", description: "", image: "", file: null });
    setIsAmenityModalOpen(true);
  };

  // ================= TESTIMONIALS CRUD LOGIC =================
  const fetchTestimonials = async () => {
    setLoadingTestimonials(true);
    try {
      const res = await fetch("http://localhost:5000/api/testimonials");
      const data = await res.json();
      if (data.success) setTestimonials(data.data);
    } catch (err) { console.error("Fetch Testimonials Error:", err); }
    finally { setLoadingTestimonials(false); }
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const url = testimonialData.id ? `http://localhost:5000/api/testimonials/${testimonialData.id}` : "http://localhost:5000/api/testimonials/create";
    const formData = new FormData();
    formData.append("name", testimonialData.name);
    formData.append("role", testimonialData.role);
    formData.append("message", testimonialData.message);
    formData.append("rating", testimonialData.rating);
    if (testimonialData.file) formData.append("image", testimonialData.file);
    else if (testimonialData.image) formData.append("image", testimonialData.image);

    try {
      const res = await fetch(url, { method: testimonialData.id ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (data.success) { fetchTestimonials(); setIsTestimonialModalOpen(false); showToast("Testimonial Saved Successfully!"); } else showToast("❌ " + (data.message || "Failed to save"));
    } catch (err) { console.error("Testimonial Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/testimonials/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setTestimonials(testimonials.filter(t => t._id !== id)); showToast("Testimonial Deleted!"); }
    } catch (err) { console.error("Testimonial Delete Error:", err); }
  };

  const openTestimonialModal = (t = null) => {
    if (t) setTestimonialData({ id: t._id, name: t.name, role: t.role || "", message: t.message, rating: t.rating || 5, image: t.image || "", file: null });
    else setTestimonialData({ id: "", name: "", role: "", message: "", rating: 5, image: "", file: null });
    setIsTestimonialModalOpen(true);
  };

  // ================= PACKAGES CRUD LOGIC =================
  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await fetch("http://localhost:5000/api/packages");
      const data = await res.json();
      if (data.success) setPackagesData(data.data);
    } catch (err) { console.error("Fetch Packages Error:", err); }
    finally { setLoadingPackages(false); }
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const url = packageForm.id ? `http://localhost:5000/api/packages/${packageForm.id}` : "http://localhost:5000/api/packages/create";
    try {
      const res = await fetch(url, { method: packageForm.id ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(packageForm) });
      const data = await res.json();
      if (data.success) { fetchPackages(); setIsPackageModalOpen(false); showToast("Package Saved Successfully!"); } else showToast("❌ " + (data.message || "Failed to save"));
    } catch (err) { console.error("Package Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setPackagesData(packagesData.filter(p => p._id !== id)); showToast("Package Deleted!"); }
    } catch (err) { console.error("Package Delete Error:", err); }
  };

  const openPackageModal = (p = null) => {
    if (p) setPackageForm({ id: p._id, category: p.category || "💍 Wedding", title: p.title, price: p.price, description: p.description, featured: p.featured });
    else setPackageForm({ id: "", category: "💍 Wedding", title: "", price: "", description: "", featured: false });
    setIsPackageModalOpen(true);
  };

  // ================= ANNOUNCEMENTS CRUD LOGIC =================
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("http://localhost:5000/api/announcements");
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch (err) { console.error("Fetch Announcements Error:", err); }
    finally { setLoadingAnnouncements(false); }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("adminToken");
    const url = announcementData.id ? `http://localhost:5000/api/announcements/${announcementData.id}` : "http://localhost:5000/api/announcements/create";
    try {
      const res = await fetch(url, { method: announcementData.id ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(announcementData) });
      const data = await res.json();
      if (data.success) { fetchAnnouncements(); setIsAnnouncementModalOpen(false); showToast("Announcement Saved Successfully!"); } else showToast("❌ " + (data.message || "Failed to save"));
    } catch (err) { console.error("Announcement Save Error:", err); }
    finally { setUpdating(false); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setAnnouncements(announcements.filter(a => a._id !== id)); showToast("Announcement Deleted!"); }
    } catch (err) { console.error("Announcement Delete Error:", err); }
  };

  const openAnnouncementModal = (a = null) => {
    if (a) setAnnouncementData({ id: a._id, text: a.text, isActive: a.isActive });
    else setAnnouncementData({ id: "", text: "", isActive: true });
    setIsAnnouncementModalOpen(true);
  };

  // ================= FILTER & SORT LOGIC (ENQUIRIES) =================
  const uniqueEventTypes = useMemo(() => {
    let base = enquiries;
    if (activeMenu === "enquiries") base = enquiries.filter(e => e.eventType !== "Contact Inquiry");
    if (activeMenu === "contacts") base = enquiries.filter(e => e.eventType === "Contact Inquiry");
    const types = new Set(base.map(e => e.eventType).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [enquiries, activeMenu]);

  const filteredAndSortedEnquiries = useMemo(() => {
    let sorted = [...enquiries];

    if (activeMenu === "enquiries") {
      sorted = sorted.filter(e => e.eventType !== "Contact Inquiry");
    } else if (activeMenu === "contacts") {
      sorted = sorted.filter(e => e.eventType === "Contact Inquiry");
    }

    // Search Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(e => 
        (e.name && e.name.toLowerCase().includes(q)) || 
        (e.phone && e.phone.includes(q)) || 
        (e.email && e.email.toLowerCase().includes(q))
      );
    }

    // Sorting
    sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Filtering
    if (filterType !== "all") return sorted.filter(enq => enq.eventType === filterType);
    return sorted;
  }, [enquiries, sortOrder, filterType, activeMenu, searchQuery]);

  // ================= ANALYTICS LOGIC =================
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Fixes month-skipping bug when 31st jumps to next month
      d.setMonth(d.getMonth() - i);
      const count = enquiries.filter(e => {
        if (!e.createdAt) return false;
        const eDate = new Date(e.createdAt);
        return eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear();
      }).length;
      data.push({ name: months[d.getMonth()], count });
    }
    return data;
  }, [enquiries]);

  const eventTypeData = useMemo(() => Object.entries(enquiries.reduce((acc, e) => {
    acc[e.eventType || "Other"] = (acc[e.eventType || "Other"] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5), [enquiries]);

  const maxMonthlyCount = useMemo(() => Math.max(...monthlyData.map(d => d.count), 5), [monthlyData]);

  // ================= DAILY ANALYTICS LOGIC =================
  const dailyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = enquiries.filter(e => {
        if (!e.createdAt) return false;
        const eDate = new Date(e.createdAt);
        return eDate.getDate() === d.getDate() && eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear();
      }).length;
      data.push({ name: days[d.getDay()], date: d.getDate(), count });
    }
    return data;
  }, [enquiries]);

  const maxDailyCount = useMemo(() => Math.max(...dailyData.map(d => d.count), 5), [dailyData]);

  // ================= NOTIFICATION LOGIC =================
  const unreadEnquiries = useMemo(() => {
    return [...enquiries].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(e => !readNotifications.has(e._id));
  }, [enquiries, readNotifications]);

  const totalContacts = useMemo(() => enquiries.filter(e => e.eventType === "Contact Inquiry").length, [enquiries]);
  const totalBookings = useMemo(() => enquiries.filter(e => e.eventType !== "Contact Inquiry").length, [enquiries]);

  // ================= GENERAL =================
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false); // Mobile me click karne par menu hide ho jayega
  };

  return (
    <>
    <style>{`
      .sidebar-gold-scroll::-webkit-scrollbar { width: 4px; }
      .sidebar-gold-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
      .sidebar-gold-scroll::-webkit-scrollbar-thumb { background: #e6b854; border-radius: 10px; }
      .sidebar-gold-scroll::-webkit-scrollbar-thumb:hover { background: #d4a342; }
    `}</style>

    {/* Toast / SMS Notification Component */}
    {toastMsg && (
      <div className="fixed top-6 right-6 z-[99999] bg-green-50 text-green-800 px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border-2 border-green-200 transition-all duration-300">
        {!toastMsg.includes("❌") && <CheckCircle className="w-6 h-6 text-green-500" />}
        {toastMsg}
      </div>
    )}

    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#391827] text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-white/10 relative shrink-0 flex items-center gap-4 bg-gradient-to-b from-black/20 to-transparent">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(230,184,84,0.4)] border-[2px] border-[#e6b854] relative group overflow-hidden cursor-pointer">
            <img src="/logo.png" alt="Arya Resort" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=A&background=e6b854&color=391827&bold=true&font-size=0.5"; }} className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-full border border-[#e6b854] animate-ping opacity-30"></div>
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-extrabold text-[#e6b854] tracking-widest drop-shadow-md">ARYA</h2>
            <p className="text-[10px] text-white/70 mt-0.5 uppercase tracking-[0.2em] font-medium">Admin Panel</p>
          </div>
          <button className="absolute top-4 right-4 md:hidden text-white/60 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5"/></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto sidebar-gold-scroll">
          <button 
            onClick={() => handleMenuClick("dashboard")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "dashboard" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => handleMenuClick("announcements")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${activeMenu === "announcements" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
          >
            <Megaphone className="w-5 h-5" /> Announcements
          </button>
          <button 
            onClick={() => handleMenuClick("hero")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "hero" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <MonitorPlay className="w-5 h-5" /> All Heros
          </button>
          <button 
            onClick={() => handleMenuClick("contacts")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "contacts" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <Mail className="w-5 h-5" /> Contacts
          </button>
          <button 
            onClick={() => handleMenuClick("enquiries")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "enquiries" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <Users className="w-5 h-5" /> Enquiries
          </button>
          <button 
            onClick={() => handleMenuClick("events")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "events" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <CalendarDays className="w-5 h-5" /> Events
          </button>
          <button 
            onClick={() => handleMenuClick("packages")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "packages" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <Gift className="w-5 h-5" /> Packages
          </button>
          <button 
            onClick={() => handleMenuClick("gallery")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "gallery" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <ImageIcon className="w-5 h-5" /> Gallery
          </button>
          <button 
            onClick={() => handleMenuClick("amenities")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "amenities" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <Sparkles className="w-5 h-5" /> Amenities
          </button>
          <button 
            onClick={() => handleMenuClick("testimonials")}
            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${activeMenu === "testimonials" ? "bg-gradient-to-r from-[#e6b854] to-[#d4a342] text-[#391827] shadow-[0_0_15px_rgba(230,184,84,0.3)]" : "text-white/70 hover:bg-gradient-to-r hover:from-[#e6b854] hover:to-[#d4a342] hover:text-[#391827] hover:shadow-[0_0_15px_rgba(230,184,84,0.3)] hover:translate-x-1"}`}
          >
            <MessageSquare className="w-5 h-5" /> Testimonials
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/10 shrink-0">
          <button onClick={handleLogout} className="group w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 bg-red-500/10 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm z-50 relative">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize truncate">{activeMenu}</h1>
              <p className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <Clock className="w-3.5 h-3.5 text-[#e6b854]" />
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Name or Phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-[#e6b854] focus:ring-2 focus:ring-[#e6b854]/20 outline-none w-64 transition-all"
              />
            </div>

            {/* ================= NOTIFICATION BELL ================= */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                {unreadEnquiries.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-[85vw] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right transform transition-all">
                    <div className="bg-[#391827] text-white px-5 py-4 flex justify-between items-center">
                      <h3 className="font-bold text-sm">New Enquiries</h3>
                      <span className="bg-[#e6b854] text-[#391827] text-xs font-bold px-2 py-0.5 rounded-full">{unreadEnquiries.length} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-gray-50">
                      {unreadEnquiries.length > 0 ? (
                        unreadEnquiries.slice(0, 5).map((enq) => (
                          <div key={enq._id} className="p-4 hover:bg-orange-50/50 transition-colors cursor-pointer" onClick={() => { 
                            setReadNotifications(prev => new Set(prev).add(enq._id));
                            setIsNotifOpen(false); 
                            setViewData(enq);
                            setIsViewModalOpen(true);
                          }}>
                            <p className="font-bold text-gray-800 text-sm mb-1">{enq.name}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span className="text-[#e6b854] font-bold">{enq.eventType}</span>
                              <span>{new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">No new enquiries</div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <button 
                        onClick={() => { setIsNotifOpen(false); handleMenuClick("enquiries"); }}
                        className="w-full text-center text-sm font-bold text-[#391827] hover:text-[#e6b854] transition-colors"
                      >
                        View All Enquiries
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50/50">
          
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-white to-orange-50/40 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 sm:p-4 bg-[#e6b854]/10 rounded-xl text-[#e6b854] shrink-0">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">Total Bookings</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{totalBookings}</h3>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-green-50/40 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 sm:p-4 bg-green-50 rounded-xl text-green-500 shrink-0">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">New This Month</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{monthlyData[5].count}</h3>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-blue-50/40 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-blue-500 shrink-0">
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">Contact Msgs</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{totalContacts}</h3>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-[#391827]/5 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-hidden">
                  <div className="p-3 sm:p-4 bg-[#391827]/10 rounded-xl text-[#391827] shrink-0">
                    <Star className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="w-full overflow-hidden">
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold">Top Event</p>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{eventTypeData.length > 0 ? eventTypeData[0][0] : "N/A"}</h3>
                  </div>
                </div>
              </div>

              {/* Analytics Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart (6 Months Trend) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 relative group">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#e6b854]" /> Booking Trends</h2>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 6 Months</span>
                  </div>
                  <div className="relative h-56 mt-4 w-full">
                    <svg className="absolute inset-0 w-full h-[85%] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <polygon points={`0,100 ${monthlyData.map((d, i) => `${(i / 5) * 100},${100 - (d.count / maxMonthlyCount) * 100}`).join(" ")} 100,100`} fill="url(#gradientLine)" opacity="0.4" />
                      <polyline points={monthlyData.map((d, i) => `${(i / 5) * 100},${100 - (d.count / maxMonthlyCount) * 100}`).join(" ")} fill="none" stroke="#e6b854" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                      {monthlyData.map((d, i) => (
                        <circle key={i} cx={`${(i / 5) * 100}`} cy={`${100 - (d.count / maxMonthlyCount) * 100}`} r="4" fill="#391827" stroke="#e6b854" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      ))}
                      <defs>
                        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#e6b854" stopOpacity="1" />
                          <stop offset="100%" stopColor="#e6b854" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 w-full h-[85%] flex items-stretch justify-between">
                      {monthlyData.map((d, i) => (
                        <div key={i} className="flex-1 group/bar relative flex flex-col justify-end items-center h-full">
                          <div className="absolute -top-10 bg-gray-800 text-[#e6b854] font-bold text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg whitespace-nowrap">{d.count} Bookings<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div></div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                      {monthlyData.map((d, i) => (
                        <span key={i} className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex-1 text-center">{d.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bars (Event Distribution) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PieChart className="w-5 h-5 text-[#391827]" /> Popular Events</h2>
                  </div>
                  <div className="space-y-5">
                    {eventTypeData.length > 0 ? eventTypeData.map(([type, count], i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-gray-700 truncate pr-2">{type}</span><span className="font-bold text-[#e6b854]">{count}</span></div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-[#e6b854] to-[#391827] h-full rounded-full transition-all duration-1000" style={{ width: `${(count / enquiries.length) * 100}%` }}></div></div>
                      </div>
                    )) : <div className="text-center py-10 text-gray-400 text-sm">No data available</div>}
                  </div>
                </div>
              </div>

            {/* Daily Analytics Graph */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Daily Enquiries</h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 7 Days</span>
              </div>
              <div className="relative h-56 mt-4 w-full">
                <svg className="absolute inset-0 w-full h-[85%] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon points={`0,100 ${dailyData.map((d, i) => `${(i / 6) * 100},${100 - (d.count / maxDailyCount) * 100}`).join(" ")} 100,100`} fill="url(#gradientLineDaily)" opacity="0.4" />
                  <polyline points={dailyData.map((d, i) => `${(i / 6) * 100},${100 - (d.count / maxDailyCount) * 100}`).join(" ")} fill="none" stroke="#22c55e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                  {dailyData.map((d, i) => (
                    <circle key={i} cx={`${(i / 6) * 100}`} cy={`${100 - (d.count / maxDailyCount) * 100}`} r="4" fill="#ffffff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  ))}
                  <defs>
                    <linearGradient id="gradientLineDaily" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 w-full h-[85%] flex items-stretch justify-between">
                  {dailyData.map((d, i) => (
                    <div key={i} className="flex-1 group/bar relative flex flex-col justify-end items-center h-full">
                      <div className="absolute -top-10 bg-gray-800 text-green-400 font-bold text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg whitespace-nowrap">{d.count} Bookings<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div></div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  {dailyData.map((d, i) => (
                    <span key={i} className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex-1 text-center leading-tight">{d.name}<br/>{d.date}</span>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ================= ENQUIRIES SECTION ================= */}
          {activeMenu === "enquiries" && (
            <div className="space-y-6">

              {/* Data Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                  <h2 className="text-lg font-bold text-gray-800 shrink-0">Recent Bookings ({filteredAndSortedEnquiries.length})</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Filter Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-48 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer">
                        {uniqueEventTypes.map(type => (
                          <option key={type} value={type}>{type === 'all' ? 'All Events' : type}</option>
                        ))}
                      </select>
                    </div>
                    {/* Sort Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full sm:w-40 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                    {/* Export Button */}
                    <button onClick={downloadEnquiriesCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loading ? (
                    <div className="text-center text-gray-500 py-20 animate-pulse font-medium">
                      Loading Enquiries Data...
                    </div>
                  ) : filteredAndSortedEnquiries.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Client Name</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                        <th className="px-6 py-4 font-bold">Address</th>
                          <th className="px-6 py-4 font-bold">Event Details</th>
                          <th className="px-6 py-4 font-bold">Guests</th>
                          <th className="px-6 py-4 font-bold">Received On</th>
                          <th className="px-6 py-4 font-bold text-center">Status</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {filteredAndSortedEnquiries.map((enq) => (
                          <tr key={enq._id} className="hover:bg-orange-50/30 transition-colors duration-200">
                            <td className="px-6 py-4 font-bold text-gray-800">{enq.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-1">
                                <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium text-gray-700">{enq.phone}</span>
                              </div>
                            <div className="text-xs text-gray-500">{enq.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-xs whitespace-normal break-words min-w-[150px] max-w-[200px]">
                            {enq.address || <span className="text-gray-400 italic">Not Provided</span>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#391827] mb-1">{formatEventDate(enq.eventDate)}</div>
                              <span className="bg-[#e6b854]/20 text-[#391827] px-3 py-1 rounded-full text-xs font-bold">
                                {enq.eventType}
                              </span>
                              {enq.message && (
                                <div className="text-xs text-gray-500 mt-2 whitespace-normal break-words min-w-[150px] max-w-[200px] italic">
                                  "{enq.message}"
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-600">{enq.guests} People</td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                              {new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                                enq.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                enq.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse'
                              }`}>
                                {enq.status === 'Confirmed' && "✅"}
                                {enq.status === 'Cancelled' && "❌"}
                                {(!enq.status || enq.status === 'Pending') && "⏳"}
                                {enq.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {enq.status === 'Confirmed' ? (
                                  <a 
                                    href={`https://wa.me/91${enq.phone}?text=${encodeURIComponent(`Hello ${enq.name},\n\nYour booking for *${enq.eventType}* on *${formatEventDate(enq.eventDate)}* has been successfully *CONFIRMED* by Arya Resort! 🎉\n\nWe look forward to hosting your grand event.\n\nRegards,\nArya Marriage Hall & Resort`)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 hover:scale-110 rounded-lg transition-all shadow-sm border border-green-200"
                                    title="Send WhatsApp SMS"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </a>
                                ) : (
                                  <button 
                                    onClick={() => handleQuickConfirm(enq)}
                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 hover:scale-110 rounded-lg transition-all shadow-sm border border-green-200"
                                    title="Quick Confirm Booking"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => openEditModal(enq)}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Enquiry"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEnquiry(enq._id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Enquiry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <CalendarHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-xl font-bold text-gray-400">No Enquiries Yet</p>
                      <p className="text-sm text-gray-400 mt-2">When someone fills the form on your website, it will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= CONTACTS SECTION ================= */}
          {activeMenu === "contacts" && (
            <div className="space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Contact Messages</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Messages received from the Contact Us page</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full sm:w-40 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <button onClick={downloadEnquiriesCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md shrink-0">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loading ? (
                    <div className="text-center text-gray-500 py-20 animate-pulse font-medium">
                      Loading Messages...
                    </div>
                  ) : filteredAndSortedEnquiries.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Client Name</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Address</th>
                          <th className="px-6 py-4 font-bold">Message</th>
                          <th className="px-6 py-4 font-bold">Received On</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {filteredAndSortedEnquiries.map((enq) => (
                          <tr key={enq._id} className="hover:bg-orange-50/30 transition-colors duration-200">
                            <td className="px-6 py-4 font-bold text-gray-800">{enq.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-1">
                                <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium text-gray-700">{enq.phone}</span>
                              </div>
                              <div className="text-xs text-gray-500">{enq.email}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-xs whitespace-normal break-words min-w-[150px] max-w-[200px]">
                              {enq.address || <span className="text-gray-400 italic">Not Provided</span>}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-xs whitespace-normal break-words min-w-[200px] max-w-[300px]">
                              {enq.message ? `"${enq.message}"` : <span className="text-gray-400 italic">No Message</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                              {new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openEditModal(enq)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Contact"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteEnquiry(enq._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Contact"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-xl font-bold text-gray-400">No Messages Yet</p>
                      <p className="text-sm text-gray-400 mt-2">When someone uses the Contact Us form, it will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= EVENTS SECTION ================= */}
          {activeMenu === "events" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Resort Events & Packages</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage all event offerings shown on the website</p>
                </div>
                <button onClick={() => openEventModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <Plus className="w-5 h-5" /> Add New Event
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingEvents ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Events...</div>
                  ) : events.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Image</th>
                          <th className="px-6 py-4 font-bold">Title</th>
                          <th className="px-6 py-4 font-bold">Category</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {events.map((ev) => (
                          <tr key={ev._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4"><img src={ev.image} alt={ev.title} className="w-16 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" /></td>
                            <td className="px-6 py-4 font-bold text-gray-800">{ev.title}</td>
                            <td className="px-6 py-4"><span className="bg-[#391827]/10 text-[#391827] px-3 py-1 rounded-full text-xs font-bold">{ev.category}</span></td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openEventModal(ev)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteEvent(ev._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <p className="text-xl font-bold text-gray-400">No Events Added Yet</p>
                      <p className="text-sm text-gray-400 mt-2">Click on 'Add New Event' to create your first event package.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= GALLERY SECTION ================= */}
          {activeMenu === "gallery" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Gallery Management</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Upload and manage resort photos</p>
                </div>
                <button onClick={() => openPhotoModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <UploadCloud className="w-5 h-5" /> Upload Photo
                </button>
              </div>

              {loadingPhotos ? (
                <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Photos...</div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {photos.map((photo) => (
                    <div key={photo._id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all aspect-video">
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#391827]/90 via-[#391827]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => handleDeletePhoto(photo._id)} 
                          className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="font-bold truncate text-sm">{photo.title || "Untitled"}</p>
                          <p className="text-xs text-[#e6b854] font-bold tracking-wider uppercase">{photo.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center py-24">
                  <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-400">No Photos Uploaded Yet</p>
                  <p className="text-sm text-gray-400 mt-2">Click on 'Upload Photo' to add images to your gallery.</p>
                </div>
              )}
            </div>
          )}

          {/* ================= HERO SECTION ================= */}
          {activeMenu === "hero" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">All Heros Management</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage images and videos for all page hero sections</p>
                </div>
                <button onClick={() => openHeroModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <Plus className="w-5 h-5" /> Add New Slide
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingHero ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Slides...</div>
                  ) : heroSlides.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Media</th>
                          <th className="px-6 py-4 font-bold">Page</th>
                          <th className="px-6 py-4 font-bold">Title</th>
                          <th className="px-6 py-4 font-bold">Subtitle</th>
                          <th className="px-6 py-4 font-bold">Type</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {heroSlides.map((slide) => (
                          <tr key={slide._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              {slide.type === 'video' ? (
                                <video src={slide.url} className="w-16 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" muted />
                              ) : (
                                <img src={slide.url} alt={slide.title} className="w-16 h-12 object-cover rounded-lg border border-gray-200 shadow-sm" />
                              )}
                            </td>
                            <td className="px-6 py-4"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold capitalize">{slide.page || 'home'}</span></td>
                            <td className="px-6 py-4 font-bold text-gray-800 whitespace-normal break-words min-w-[150px] max-w-[250px]">{slide.title}</td>
                            <td className="px-6 py-4 text-gray-600 whitespace-normal break-words min-w-[200px] max-w-[350px]">{slide.subtitle}</td>
                            <td className="px-6 py-4"><span className="bg-[#391827]/10 text-[#391827] px-3 py-1 rounded-full text-xs font-bold uppercase">{slide.type}</span></td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openHeroModal(slide)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteHero(slide._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <p className="text-xl font-bold text-gray-400">No Slides Found</p>
                      <p className="text-sm text-gray-400 mt-2">Add a new image or video slide to show on homepage.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= AMENITIES SECTION ================= */}
          {activeMenu === "amenities" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Resort Amenities & Facilities</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage facilities like pool, spa, wifi etc.</p>
                </div>
                <button onClick={() => openAmenityModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <Plus className="w-5 h-5" /> Add New Amenity
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingAmenities ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Amenities...</div>
                  ) : amenities.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Icon/Image</th>
                          <th className="px-6 py-4 font-bold">Title</th>
                          <th className="px-6 py-4 font-bold">Description</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {amenities.map((am) => (
                          <tr key={am._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4"><img src={am.image} alt={am.title} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm bg-gray-50 p-1" /></td>
                            <td className="px-6 py-4 font-bold text-gray-800">{am.title}</td>
                            <td className="px-6 py-4 text-gray-600 whitespace-normal break-words min-w-[200px] max-w-[350px]">{am.description}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openAmenityModal(am)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteAmenity(am._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <p className="text-xl font-bold text-gray-400">No Amenities Added</p>
                      <p className="text-sm text-gray-400 mt-2">Click on 'Add New Amenity' to list your resort's features.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TESTIMONIALS SECTION ================= */}
          {activeMenu === "testimonials" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Guest Stories & Testimonials</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage client reviews and feedback</p>
                </div>
                <button onClick={() => openTestimonialModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <Plus className="w-5 h-5" /> Add New Testimonial
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingTestimonials ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Testimonials...</div>
                  ) : testimonials.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Guest</th>
                          <th className="px-6 py-4 font-bold">Rating</th>
                          <th className="px-6 py-4 font-bold">Message</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {testimonials.map((t) => (
                          <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {t.image ? (
                                <img src={t.image} alt={t.name} className="w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                  <User className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-800">{t.name}</p>
                                <p className="text-xs text-gray-500">{t.role}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-[#e6b854]">
                                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 whitespace-normal break-words min-w-[200px] max-w-[350px]">"{t.message}"</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openTestimonialModal(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteTestimonial(t._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <p className="text-xl font-bold text-gray-400">No Testimonials Found</p>
                      <p className="text-sm text-gray-400 mt-2">Add your first guest review to build trust on the website.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= PACKAGES SECTION ================= */}
          {activeMenu === "packages" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Wedding & Event Packages</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Manage all pricing plans and packages</p>
                </div>
                <button onClick={() => openPackageModal()} className="w-full sm:w-auto justify-center bg-[#e6b854] hover:bg-[#d4a342] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                  <Plus className="w-5 h-5" /> Add New Package
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingPackages ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Packages...</div>
                  ) : packagesData.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Package Name</th>
                          <th className="px-6 py-4 font-bold">Price</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {packagesData.map((pkg) => (
                          <tr key={pkg._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-800">
                              {pkg.title}
                              <div className="mt-1.5 flex items-center">
                                <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border border-orange-100">{pkg.category || "💍 Wedding"}</span>
                              </div>
                              <div className="text-xs font-normal text-gray-500 mt-1.5 whitespace-normal max-w-xs line-clamp-1">{pkg.description}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#e6b854] text-lg">{pkg.price}</td>
                            <td className="px-6 py-4">
                              {pkg.featured ? (
                                <span className="bg-[#391827]/10 text-[#391827] px-3 py-1 rounded-full text-xs font-bold">Most Popular</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Standard</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openPackageModal(pkg)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeletePackage(pkg._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24">
                      <p className="text-xl font-bold text-gray-400">No Packages Added</p>
                      <p className="text-sm text-gray-400 mt-2">Click on 'Add New Package' to create your first pricing plan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= ANNOUNCEMENTS SECTION ================= */}
          {activeMenu === "announcements" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center bg-gradient-to-r from-white to-orange-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e6b854]/20 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#391827] flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-[#e6b854] animate-pulse" /> 
                    Top Announcements & Offers
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage the scrolling animated ticker on the website header</p>
                </div>
                <button onClick={() => openAnnouncementModal()} className="w-full sm:w-auto justify-center bg-gradient-to-r from-[#e6b854] to-[#d4a342] hover:to-[#c39332] text-[#391827] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 relative z-10">
                  <Plus className="w-5 h-5" /> Add New Offer
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
                  {loadingAnnouncements ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Loading Announcements...</div>
                  ) : announcements.length > 0 ? (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 font-bold">Offer Text</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                        {announcements.map((a) => (
                          <tr key={a._id} className="hover:bg-orange-50/40 transition-all duration-300 group cursor-pointer">
                            <td className="px-6 py-4 font-bold text-[#391827] whitespace-normal break-words min-w-[300px] group-hover:text-[#d4a342] transition-colors duration-300">{a.text}</td>
                            <td className="px-6 py-4">
                              {a.isActive ? (
                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                  </span>
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => openAnnouncementModal(a)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-transform duration-300 hover:scale-110"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteAnnouncement(a._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-transform duration-300 hover:scale-110"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                        <Megaphone className="w-12 h-12 text-[#e6b854] animate-bounce" />
                      </div>
                      <p className="text-xl font-extrabold text-[#391827]">No Offers Running</p>
                      <p className="text-sm text-gray-500 mt-2 max-w-sm">You haven't added any announcements yet. Create one to show a scrolling ticker on the website.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 bg-white rounded-full p-1">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">Edit Enquiry Details</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handleUpdateSubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Client Name</label>
                    <input type="text" required value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <input type="text" required value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                    <input type="email" required value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                    <input type="text" required value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Date</label>
                    <input type="text" required value={editData.eventDate} onChange={(e) => setEditData({...editData, eventDate: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Guests</label>
                    <input type="number" required value={editData.guests} onChange={(e) => setEditData({...editData, guests: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Type</label>
                    <input type="text" required value={editData.eventType} onChange={(e) => setEditData({...editData, eventType: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Client Message</label>
                    <textarea rows="3" value={editData.message} onChange={(e) => setEditData({...editData, message: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all resize-none" placeholder="No message provided"></textarea>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Booking Status</label>
                    <div className="relative">
                      <select value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer font-extrabold text-[#391827]">
                        <option value="Pending">⏳ Pending (In Review)</option>
                        <option value="Confirmed">✅ Confirmed (Block Date)</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button onClick={() => setIsEventModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6">{eventData.id ? "Edit Event" : "Add New Event"}</h2>
            
            <form onSubmit={handleEventSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Event Title</label>
                  <input type="text" required value={eventData.title} onChange={(e) => setEventData({...eventData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Royal Wedding Package" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <input type="text" required value={eventData.category} onChange={(e) => setEventData({...eventData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Wedding, Corporate" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Event Image</label>
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#e6b854] mb-3 transition-colors" />
                    <p className="text-sm text-gray-600 font-medium mb-1">Click or drag image to upload</p>
                    <input type="file" accept="image/*" required={!eventData.id} onChange={(e) => setEventData({...eventData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {eventData.file ? (
                      <p className="text-xs text-[#391827] font-bold mt-2 text-center bg-[#e6b854] px-3 py-1 rounded-full">Selected: {eventData.file.name}</p>
                    ) : eventData.image ? (
                      <p className="text-xs text-green-600 font-bold mt-2 text-center bg-green-50 px-3 py-1 rounded-full border border-green-200">Current image already saved</p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {updating ? (eventData.file ? "Uploading Image (Please Wait)..." : "Saving Event...") : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button onClick={() => setIsPhotoModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6">Upload New Photo</h2>
            
            <form onSubmit={handlePhotoSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Image File</label>
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#e6b854] mb-3 transition-colors" />
                    <p className="text-sm text-gray-600 font-medium mb-1">Click or drag image to upload</p>
                    <input type="file" accept="image/*" required onChange={(e) => setPhotoData({...photoData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {photoData.file && <p className="text-xs text-[#391827] font-bold mt-2 text-center bg-[#e6b854] px-3 py-1 rounded-full">Selected: {photoData.file.name}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Title (Optional)</label>
                  <input type="text" value={photoData.title} onChange={(e) => setPhotoData({...photoData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Royal Suite" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <input type="text" required value={photoData.category} onChange={(e) => setPhotoData({...photoData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Rooms, Pool, Wedding" />
                </div>
              </div>
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {updating ? "Uploading Photo (Please Wait)..." : "Upload Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Modal */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsHeroModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 bg-white rounded-full p-1">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">{heroData.id ? "Edit Slide" : "Add New Slide"}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handleHeroSubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Slide Title</label>
                    <input type="text" required value={heroData.title} onChange={(e) => setHeroData({...heroData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Beautiful Garden Wedding" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Subtitle</label>
                    <input type="text" required value={heroData.subtitle} onChange={(e) => setHeroData({...heroData, subtitle: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Natural Elegance Awaits" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Page</label>
                    <select value={heroData.page} onChange={(e) => setHeroData({...heroData, page: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all">
                      <option value="home">Home Page (Slider)</option>
                      <option value="about">About Us Page</option>
                      <option value="amenities">Amenities Page</option>
                      <option value="events">Events Page</option>
                      <option value="gallery">Gallery Page</option>
                      <option value="contact">Contact Us Page</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Media Type</label>
                    <select value={heroData.type} onChange={(e) => setHeroData({...heroData, type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all">
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload New Media</label>
                    <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                      <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#e6b854] mb-3 transition-colors" />
                      <p className="text-sm text-gray-600 font-medium mb-1">Click or drag {heroData.type} to upload</p>
                      <input type="file" accept={heroData.type === 'video' ? "video/*" : "image/*"} required={!heroData.url && !heroData.id} onChange={(e) => setHeroData({...heroData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {heroData.file ? (
                        <p className="text-xs text-[#391827] font-bold mt-2 text-center bg-[#e6b854] px-3 py-1 rounded-full">Selected: {heroData.file.name}</p>
                      ) : heroData.url ? (
                        <p className="text-xs text-green-600 font-bold mt-2 text-center bg-green-50 px-3 py-1 rounded-full border border-green-200">Current media already saved</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? (heroData.file ? "Uploading File (Please Wait)..." : "Saving Changes...") : "Save Slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Modal */}
      {isAmenityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsAmenityModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">{amenityData.id ? "Edit Amenity" : "Add New Amenity"}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handleAmenitySubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Amenity Title</label>
                    <input type="text" required value={amenityData.title} onChange={(e) => setAmenityData({...amenityData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Free High-Speed WiFi" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                    <textarea rows="3" required value={amenityData.description} onChange={(e) => setAmenityData({...amenityData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all resize-none" placeholder="Brief details about the facility..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Icon / Image</label>
                    <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                      <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#e6b854] mb-3 transition-colors" />
                      <p className="text-sm text-gray-600 font-medium mb-1">Click or drag image to upload</p>
                      <input type="file" accept="image/*" required={!amenityData.id && !amenityData.image} onChange={(e) => setAmenityData({...amenityData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {amenityData.file ? (
                        <p className="text-xs text-[#391827] font-bold mt-2 text-center bg-[#e6b854] px-3 py-1 rounded-full">Selected: {amenityData.file.name}</p>
                      ) : amenityData.image ? (
                        <p className="text-xs text-green-600 font-bold mt-2 text-center bg-green-50 px-3 py-1 rounded-full border border-green-200">Current media already saved</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? (amenityData.file ? "Uploading Image..." : "Saving Changes...") : "Save Amenity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsTestimonialModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">{testimonialData.id ? "Edit Testimonial" : "Add New Testimonial"}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handleTestimonialSubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Guest Name</label>
                    <input type="text" required value={testimonialData.name} onChange={(e) => setTestimonialData({...testimonialData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Role / Location</label>
                    <input type="text" required value={testimonialData.role} onChange={(e) => setTestimonialData({...testimonialData, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Groom, Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Rating (1-5)</label>
                    <input type="number" min="1" max="5" required value={testimonialData.rating} onChange={(e) => setTestimonialData({...testimonialData, rating: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Guest Photo (Optional)</label>
                    <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                      <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#e6b854] mb-3 transition-colors" />
                      <p className="text-sm text-gray-600 font-medium mb-1">Click or drag image to upload</p>
                      <input type="file" accept="image/*" onChange={(e) => setTestimonialData({...testimonialData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {testimonialData.file ? (
                        <p className="text-xs text-[#391827] font-bold mt-2 text-center bg-[#e6b854] px-3 py-1 rounded-full">Selected: {testimonialData.file.name}</p>
                      ) : testimonialData.image ? (
                        <p className="text-xs text-green-600 font-bold mt-2 text-center bg-green-50 px-3 py-1 rounded-full border border-green-200">Current photo already saved</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Review Message</label>
                    <textarea rows="4" required value={testimonialData.message} onChange={(e) => setTestimonialData({...testimonialData, message: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all resize-none" placeholder="What did they say about the resort?"></textarea>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? (testimonialData.file ? "Uploading Image..." : "Saving Changes...") : "Save Testimonial"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Packages Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsPackageModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">{packageForm.id ? "Edit Package" : "Add New Package"}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handlePackageSubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Package Category</label>
                    <div className="relative">
                      <select required value={packageForm.category} onChange={(e) => setPackageForm({...packageForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer text-[#391827] font-semibold">
                        <option value="💍 Wedding">💍 Wedding</option>
                        <option value="🎉 Reception">🎉 Reception</option>
                        <option value="🌼 Haldi / Mehendi">🌼 Haldi / Mehendi</option>
                        <option value="👔 Corporate Event">👔 Corporate Event</option>
                        <option value="🎂 Birthday / Party">🎂 Birthday / Party</option>
                        <option value="✨ Other (Custom Event)">✨ Other (Custom Event)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Package Title</label>
                    <input type="text" required value={packageForm.title} onChange={(e) => setPackageForm({...packageForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all" placeholder="e.g. Royal Wedding" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Price</label>
                    <input 
                      type="text" 
                      required 
                      value={packageForm.price} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, "");
                        if (val) val = "₹ " + parseInt(val, 10).toLocaleString("en-IN");
                        setPackageForm({...packageForm, price: val});
                      }} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all font-semibold" 
                      placeholder="e.g. ₹ 2,35,000" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                    <textarea rows="3" required value={packageForm.description} onChange={(e) => setPackageForm({...packageForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all resize-none" placeholder="Details about this package..."></textarea>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Highlight / Badge</label>
                    <div className="relative">
                      <select value={packageForm.featured} onChange={(e) => setPackageForm({...packageForm, featured: e.target.value === "true"})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer">
                        <option value="false">Standard Package (White Background)</option>
                        <option value="true">Make it "Most Popular" (Maroon Theme)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? "Saving Package..." : "Save Package"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[95vh] flex flex-col">
            <button onClick={() => setIsAnnouncementModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors z-10 rounded-full p-1.5">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#391827] mb-6 shrink-0">{announcementData.id ? "Edit Offer" : "Add New Offer"}</h2>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2">
              <form onSubmit={handleAnnouncementSubmit} className="space-y-5 pb-2">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Announcement Text</label>
                    <textarea required rows="3" value={announcementData.text} onChange={(e) => setAnnouncementData({...announcementData, text: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all resize-none" placeholder="e.g. ✨ Flat 20% Off on Summer Wedding Packages!"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select value={announcementData.isActive} onChange={(e) => setAnnouncementData({...announcementData, isActive: e.target.value === "true"})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e6b854] focus:ring-1 focus:ring-[#e6b854] transition-all appearance-none cursor-pointer font-semibold text-[#391827]">
                        <option value="true">✅ Active (Show on website)</option>
                        <option value="false">❌ Inactive (Hide)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-[#391827] hover:bg-[#2d111e] text-white font-bold py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {updating ? "Saving..." : "Save Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Notification Modal (No Edit) */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 transition-colors rounded-full p-1.5 z-10">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#e6b854]/20 rounded-full flex items-center justify-center text-[#e6b854]">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#391827]">New Notification</h2>
                <p className="text-sm text-gray-500">Received on {new Date(viewData.createdAt).toLocaleString('en-GB')}</p>
              </div>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Client Name</p><p className="font-bold text-gray-800">{viewData.name}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone</p><p className="font-semibold text-gray-800">{viewData.phone}</p></div>
                <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email</p><p className="font-semibold text-gray-800 break-all">{viewData.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Event Type</p><span className="inline-block bg-[#e6b854]/20 text-[#391827] px-2.5 py-0.5 rounded-md text-xs font-bold border border-[#e6b854]/30">{viewData.eventType}</span></div>
                <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Guests / Date</p><p className="font-semibold text-gray-800">{viewData.guests} • {formatEventDate(viewData.eventDate)}</p></div>
              </div>
              {viewData.message && <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Message</p><p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">"{viewData.message}"</p></div>}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => setIsViewModalOpen(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3.5 rounded-xl transition-all shadow-sm">Close View</button>
              {viewData.status === 'Confirmed' ? (
                <a href={`https://wa.me/91${viewData.phone}?text=${encodeURIComponent(`Hello ${viewData.name},\n\nYour booking for *${viewData.eventType}* on *${formatEventDate(viewData.eventDate)}* has been successfully *CONFIRMED* by Arya Resort! 🎉\n\nWe look forward to hosting your grand event.\n\nRegards,\nArya Marriage Hall & Resort`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5"/> Send SMS
                </a>
              ) : (
                <button onClick={() => handleQuickConfirm(viewData)} disabled={updating} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                  <CheckCircle className="w-5 h-5"/> {updating ? "Wait..." : "Confirm Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
export default Dashboard;