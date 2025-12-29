"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Shield,
  Download,
  Eye,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Search,
  Filter,
  Calendar,
  User,
  FileCheck,
  Sparkles,
  Crown,
  Star,
  Zap,
  RefreshCcw,
  ChevronDown,
  AlertTriangle,
  Info,
  CheckSquare,
  FileText,
  Brain,
} from "lucide-react";

/* ----------------------------------------------- */
/* HELPER FUNCTIONS FROM REPORTS PAGE */
/* ----------------------------------------------- */
const formatServiceName = (raw = "") =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const isAIValidationCheck = (checkName) => {
  return checkName === "ai_cv_validation" || checkName === "ai_education_validation";
};

const MANUAL_SERVICES = [
  { id: "address_verification", name: "Address Verification" },
  { id: "education_check_manual", name: "Education Manual Check" },
  { id: "employment_history_manual", name: "Employment History Manual" },
  { id: "employment_history_manual_2", name: "Employment History Manual 2" },
  { id: "supervisory_check_1", name: "Supervisory Check 1" },
  { id: "supervisory_check_2", name: "Supervisory Check 2" },
];

/* ----------------------------------------------- */
/* SERVICE ICONS & CONFIGURATION */
/* ----------------------------------------------- */
const SERVICE_ICONS = {
  pan_aadhaar_seeding: "🪪",
  pan_verification: "📄", 
  verify_pan_to_uan: "🔗",
  employment_history: "👔",
  credit_report: "💳",
  court_record: "⚖️",
  address_verification: "🏠",
  education_check_manual: "🎓",
  employment_history_manual: "📋",
  employment_history_manual_2: "📋",
  supervisory_check_1: "👥",
  supervisory_check_2: "👥",
  ai_cv_validation: "🤖",
  ai_education_validation: "🧠",
};

const SERVICE_NAMES = {
  pan_aadhaar_seeding: "PAN Aadhaar Seeding",
  pan_verification: "PAN Verification",
  verify_pan_to_uan: "PAN to UAN Verification", 
  employment_history: "Employment History",
  credit_report: "Credit Report",
  court_record: "Court Record",
  address_verification: "Address Verification",
  education_check_manual: "Education Verification",
  employment_history_manual: "Employment History Manual",
  employment_history_manual_2: "Employment History Manual 2",
  supervisory_check_1: "Supervisory Check 1",
  supervisory_check_2: "Supervisory Check 2",
  ai_cv_validation: "AI CV Validation",
  ai_education_validation: "AI Education Validation",
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return 'text-green-600 bg-green-100';
    case 'FAILED': return 'text-red-600 bg-red-100';
    case 'PENDING': return 'text-yellow-600 bg-yellow-100';
    case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED': return <CheckCircle size={16} className="text-green-600" />;
    case 'FAILED': return <XCircle size={16} className="text-red-600" />;
    case 'PENDING': return <Clock size={16} className="text-yellow-600" />;
    case 'IN_PROGRESS': return <Loader2 size={16} className="text-blue-600 animate-spin" />;
    default: return <AlertTriangle size={16} className="text-gray-600" />;
  }
};

/* ----------------------------------------------- */
/* CERTIFICATE TEMPLATES */
/* ----------------------------------------------- */
const CERTIFICATE_TEMPLATES = {
  GOLD: {
    name: "Gold Certificate",
    color: "from-yellow-400 to-amber-600",
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    borderColor: "border-yellow-300",
    icon: Crown,
    description: "Premium verification with 100% completion",
    minScore: 95,
  },
  SILVER: {
    name: "Silver Certificate",
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
    borderColor: "border-gray-300",
    icon: Star,
    description: "Standard verification with 85%+ completion",
    minScore: 85,
  },
  BRONZE: {
    name: "Bronze Certificate",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    borderColor: "border-orange-300",
    icon: Award,
    description: "Basic verification with 70%+ completion",
    minScore: 70,
  },
  VERIFIED: {
    name: "Verified Certificate",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    borderColor: "border-blue-300",
    icon: Shield,
    description: "Standard verification completed",
    minScore: 50,
  },
};

/* ----------------------------------------------- */
/* MAIN COMPONENT */
/* ----------------------------------------------- */
export default function CertificatesPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("ALL");
  const [generatingCert, setGeneratingCert] = useState(null);
  const [expandedCandidate, setExpandedCandidate] = useState(null);

  /* ----------------------------------------------- */
  /* FETCH ORGANIZATIONS */
  /* ----------------------------------------------- */
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/proxy/secure/getOrganizations", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    }
  };

  /* ----------------------------------------------- */
  /* FETCH CANDIDATES - SIMPLIFIED LIKE REPORTS PAGE */
  /* ----------------------------------------------- */
  const fetchCandidates = async (orgId, forceRefresh = false) => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/secure/getCandidates?orgId=${orgId}`, {
        credentials: "include",
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch candidates");
      
      const list = data.candidates || [];
      
      // Enrich with verification data - same as reports page
      const enriched = await Promise.all(
        list.map(async (c) => {
          try {
            const verRes = await fetch(
              `/api/proxy/secure/getVerifications?candidateId=${c._id}`,  
              { credentials: "include" }
            );
            const verData = await verRes.json();
            const verification = verData.verifications?.[0] || null;
            
            // Calculate certificate level and completion score
            const certificateLevel = calculateCertificateLevel(verification);
            const completionScore = calculateCompletionScore(verification);
            
            return { 
              ...c, 
              verification: verification,
              certificateLevel: certificateLevel,
              completionScore: completionScore,
            };
          } catch (_) {
            return { 
              ...c, 
              verification: null,
              certificateLevel: null,
              completionScore: 0,
            };
          }
        })
      );
      
      setCandidates(enriched);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------- */
  /* CERTIFICATE CALCULATION */
  /* ----------------------------------------------- */
  const calculateCompletionScore = (verification) => {
    if (!verification || !verification.stages) return 0;
    
    let totalChecks = 0;
    let completedChecks = 0;
    
    Object.values(verification.stages).forEach(stageData => {
      if (Array.isArray(stageData)) {
        stageData.forEach(check => {
          totalChecks++;
          if (check.status === 'COMPLETED') {
            completedChecks++;
          }
        });
      }
    });
    
    return totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
  };

  const calculateCertificateLevel = (verification) => {
    const score = calculateCompletionScore(verification);
    
    if (score >= 95) return "GOLD";
    if (score >= 85) return "SILVER";
    if (score >= 70) return "BRONZE";
    if (score >= 50) return "VERIFIED";
    return null;
  };

  /* ----------------------------------------------- */
  /* GENERATE MERGED CERTIFICATE WITH INDEX PAGE - LIKE REPORTS PAGE */
  /* ----------------------------------------------- */
  const generateCertificate = async (candidate) => {
    setGeneratingCert(candidate._id);
    
    try {
      // Get all service IDs for individual certificates
      const v = candidate.verification || {};
      const primaryChecks = v?.stages?.primary || [];
      const secondaryChecks = v?.stages?.secondary || [];
      const finalChecks = v?.stages?.final || [];
      
      const allServiceIds = [
        ...primaryChecks.map((chk) => getServiceCertId("primary", chk.checkName || chk.check, candidate._id)),
        ...secondaryChecks.map((chk) => getServiceCertId("secondary", chk.checkName || chk.check, candidate._id)),
        ...finalChecks.map((chk) => getServiceCertId("final", chk.checkName || chk.check, candidate._id)),
      ];

      // Generate merged certificate with index page
      await mergeAllCertificates(
        allServiceIds,
        `TFG_Enterprise_${candidate.firstName}_${candidate.lastName}_Complete_Certificate_Package.pdf`,
        setGeneratingCert,
        candidate,
        v
      );
    } catch (err) {
      console.error("Failed to generate certificate:", err);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCert(null);
    }
  };

  /* ----------------------------------------------- */
  /* INDIVIDUAL SERVICE CERTIFICATE GENERATION */
  /* ----------------------------------------------- */
  const downloadSingleServiceCert = async (id, fileName, candidate, check, stage) => {
    try {
      setGeneratingCert(`${candidate._id}-${stage}-${check.checkName || check.check}`);
      
      const element = document.getElementById(id);
      if (!element) {
        alert("Certificate not ready. Please try again.");
        return;
      }

      // Wait a moment for element to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Import the safe canvas utility like reports page
      const { safeHtml2Canvas } = await import('@/utils/safeHtml2Canvas');
      const { jsPDF } = await import('jspdf');

      // Create a temporary visible container like reports page does
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '0px';
      tempContainer.style.top = '0px';
      tempContainer.style.zIndex = '-1000';
      tempContainer.style.visibility = 'visible';
      tempContainer.style.width = '860px';
      tempContainer.style.minHeight = '1120px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.color = '#000';
      tempContainer.style.padding = '10px 50px 60px 50px';
      
      // Clone the element content
      tempContainer.innerHTML = element.innerHTML;
      
      // Add to document body
      document.body.appendChild(tempContainer);

      try {
        // Wait for reflow and rendering
        await new Promise(resolve => setTimeout(resolve, 300));

        // Validate temp container dimensions
        if (tempContainer.offsetWidth === 0 || tempContainer.offsetHeight === 0) {
          console.error('Temp container still has no dimensions');
          alert("Certificate element not properly rendered. Please try again.");
          return;
        }

        // Use the same approach as reports page with validation
        const canvas = await safeHtml2Canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: tempContainer.offsetWidth,
          height: tempContainer.offsetHeight,
          logging: false,
        });

        // Validate canvas
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.error('Invalid canvas generated');
          alert("Failed to generate certificate image. Please try again.");
          return;
        }

        const imgData = canvas.toDataURL("image/png", 1.0);
        
        // Validate image data
        if (!imgData || !imgData.startsWith('data:image/png;base64,')) {
          console.error('Invalid image data generated');
          alert("Failed to generate certificate image. Please try again.");
          return;
        }

        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "pt",
          format: [canvas.width * 0.75, canvas.height * 0.75],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);

        // Add clickable links for attachments
        const attachments = check.attachments || [];
        if (attachments && attachments.length > 0) {
          const attachmentLinks = tempContainer.querySelectorAll('a[href^="http"]');
          attachmentLinks.forEach((link, idx) => {
            if (idx < attachments.length) {
              try {
                const rect = link.getBoundingClientRect();
                const containerRect = tempContainer.getBoundingClientRect();
                
                const x = ((rect.left - containerRect.left) * canvas.width * 0.75) / tempContainer.offsetWidth;
                const y = ((rect.top - containerRect.top) * canvas.height * 0.75) / tempContainer.offsetHeight;
                const width = (rect.width * canvas.width * 0.75) / tempContainer.offsetWidth;
                const height = (rect.height * canvas.height * 0.75) / tempContainer.offsetHeight;
                
                if (x >= 0 && y >= 0 && width > 0 && height > 0) {
                  pdf.link(x, y, width, height, { url: attachments[idx] });
                }
              } catch (linkErr) {
                console.warn('Failed to add link:', linkErr);
              }
            }
          });
        }

        pdf.save(fileName);
      } finally {
        // Always remove temp container
        if (tempContainer && tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      }
    } catch (err) {
      console.error('Failed to generate individual certificate:', err);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCert(null);
    }
  };

  /* ----------------------------------------------- */
  /* MERGE ALL CERTIFICATES WITH INDEX PAGE - LIKE REPORTS PAGE */
  /* ----------------------------------------------- */
  const mergeAllCertificates = async (ids, fileName, setDownloading, candidate, verification) => {
    try {
      setDownloading(candidate._id);
      let pdf;

      // Import the safe canvas utility like reports page
      const { safeHtml2Canvas } = await import('@/utils/safeHtml2Canvas');
      const { jsPDF } = await import('jspdf');

      // Create index page
      const indexDiv = document.createElement("div");
      indexDiv.id = "temp-index-page";
      indexDiv.style.position = "absolute";
      indexDiv.style.left = "-9999px";
      indexDiv.style.top = "0";
      document.body.appendChild(indexDiv);

      const allChecks = [];
      const stages = verification?.stages || {};

      if (stages.primary) {
        stages.primary.forEach((chk) => {
          allChecks.push({ ...chk, stage: "Primary" });
        });
      }
      if (stages.secondary) {
        stages.secondary.forEach((chk) => {
          allChecks.push({ ...chk, stage: "Secondary" });
        });
      }
      if (stages.final) {
        stages.final.forEach((chk) => {
          allChecks.push({ ...chk, stage: "Final" });
        });
      }

      // Build verification summary table rows
      const tableRows = allChecks.map((chk, index) => {
        const status = chk.status || "PENDING";
        let statusText = "";
        let statusColor = "";

        if (status === "COMPLETED") {
          statusText = "✓ Verified";
          statusColor = "#22c55e";
        } else if (status === "FAILED") {
          statusText = "✗ Failed";
          statusColor = "#ef4444";
        } else {
          statusText = "○ Pending";
          statusColor = "#9ca3af";
        }

        const serviceName = SERVICE_NAMES[chk.checkName || chk.check] || formatServiceName(chk.checkName || chk.check);

        return '<tr style="background: ' + (index % 2 === 0 ? "#ffffff" : "#f9f9f9") + ';">' +
          '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + chk.stage + '</td>' +
          '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + serviceName + '</td>' +
          '<td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: ' + statusColor + '; border-bottom: 1px solid #e0e0e0;">' + statusText + '</td>' +
          '</tr>';
      }).join("");

      const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel] || CERTIFICATE_TEMPLATES.VERIFIED;

      indexDiv.innerHTML = 
        '<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">' +
        '<img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />' +
        '<div style="position: relative; z-index: 2;">' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">' +
        '<div style="flex-shrink: 0; margin-top: 5px;"><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" /></div>' +
        '<div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 55px; flex: 1; padding: 0 20px;"><h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 0 0 8px 0; line-height: 1.3;">TFG Enterprise ' + template.name + '</h1><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.4;">Comprehensive Background Verification Certificate</p></div>' +
        '<div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 12px; color: #333; line-height: 1.8;"><p style="margin: 0 0 5px 0; font-weight: bold;">📞 +91-8235-279-810</p><p style="margin: 0 0 5px 0;">✉ info@tfgai.in</p><p style="margin: 0;">🌐 tfgai.in</p></div>' +
        '</div>' +
        '<div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 10px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Candidate Information</h2>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + candidate.firstName + ' ' + candidate.lastName + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Email:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (candidate.email || "N/A") + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Phone:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (candidate.phone || "N/A") + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Organization:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (selectedOrg?.organizationName || "N/A") + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Certificate Level:</td><td style="padding: 8px 0; font-size: 13px; color: #000; font-weight: bold;">' + template.name + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Completion Score:</td><td style="padding: 8px 0; font-size: 13px; color: #000; font-weight: bold;">' + candidate.completionScore + '%</td></tr>' +
        '</table></div>' +
        '<div style="margin-bottom: 30px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Verification Summary</h2>' +
        '<table style="width: 100%; border-collapse: collapse; border: 2px solid #e0e0e0;">' +
        '<thead><tr style="background: #f0f0f0;">' +
        '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">BGV Check</th>' +
        '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">Service</th>' +
        '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd;">Status</th>' +
        '</tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
        '</table></div>' +
        '<div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;"><div style="font-size: 11px; color: #666; margin-bottom: 15px;">' +
        '<p style="margin: 5px 0;">Generated on: ' + new Date().toLocaleString() + '</p>' +
        '<p style="margin: 5px 0;">Total Verifications: ' + allChecks.length + '</p>' +
        '<p style="margin: 5px 0;">Completed: ' + allChecks.filter((c) => c.status === "COMPLETED").length + '</p>' +
        '<p style="margin: 5px 0;">Certificate ID: TFG-' + candidate._id.slice(-8).toUpperCase() + '</p>' +
        '</div><div style="margin-top: 120px; padding-top: 15px; border-top: 2px solid #272626ff; font-size: 12px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">' +
        '<p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>' +
        '</div></div></div></div>';

      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate PDF for index page using safe canvas with validation
      const canvas = await safeHtml2Canvas(indexDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Validate canvas
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to generate index page canvas');
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Validate image data
      if (!imgData || !imgData.startsWith('data:image/png;base64,')) {
        throw new Error('Failed to generate index page image');
      }

      pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "pt",
        format: [canvas.width * 0.75, canvas.height * 0.75],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      document.body.removeChild(indexDiv);

      // Add individual service certificates
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) {
          console.warn(`Element with id ${id} not found, skipping`);
          continue;
        }

        // Create a temporary visible container for each certificate
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '0px';
        tempContainer.style.top = '0px';
        tempContainer.style.zIndex = '-1000';
        tempContainer.style.visibility = 'visible';
        tempContainer.style.width = '860px';
        tempContainer.style.minHeight = '1120px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.color = '#000';
        tempContainer.style.padding = '10px 50px 60px 50px';
        
        // Clone the element content
        tempContainer.innerHTML = el.innerHTML;
        
        // Add to document body
        document.body.appendChild(tempContainer);

        try {
          // Wait for reflow and rendering
          await new Promise(resolve => setTimeout(resolve, 200));

          // Validate temp container dimensions
          if (tempContainer.offsetWidth === 0 || tempContainer.offsetHeight === 0) {
            console.warn(`Temp container for ${id} still has no dimensions, skipping`);
            continue;
          }

          // Use safe canvas for individual certificates too with validation
          const canvas = await safeHtml2Canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
          });

          // Validate canvas
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.warn(`Failed to generate canvas for ${id}, skipping`);
            continue;
          }

          const imgData = canvas.toDataURL("image/png", 1.0);
          
          // Validate image data
          if (!imgData || !imgData.startsWith('data:image/png;base64,')) {
            console.warn(`Failed to generate image for ${id}, skipping`);
            continue;
          }
          
          pdf.addPage([canvas.width * 0.75, canvas.height * 0.75]);
          pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);

          // Add clickable links for attachments
          const attachmentLinks = tempContainer.querySelectorAll('a[href^="http"]');
          attachmentLinks.forEach((link) => {
            try {
              const rect = link.getBoundingClientRect();
              const containerRect = tempContainer.getBoundingClientRect();
              const x = ((rect.left - containerRect.left) * canvas.width * 0.75) / tempContainer.offsetWidth;
              const y = ((rect.top - containerRect.top) * canvas.height * 0.75) / tempContainer.offsetHeight;
              const width = (rect.width * canvas.width * 0.75) / tempContainer.offsetWidth;
              const height = (rect.height * canvas.height * 0.75) / tempContainer.offsetHeight;
              
              if (x >= 0 && y >= 0 && width > 0 && height > 0) {
                pdf.link(x, y, width, height, { url: link.href });
              }
            } catch (linkErr) {
              console.warn('Failed to add link:', linkErr);
            }
          });
        } catch (certErr) {
          console.warn(`Failed to process certificate ${id}:`, certErr);
          continue;
        } finally {
          // Always remove temp container
          if (tempContainer && tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
          }
        }
      }

      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate merged certificate:', err);
      alert('Failed to generate certificate package. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  /* ----------------------------------------------- */
  /* GET SERVICE CERTIFICATE ID */
  /* ----------------------------------------------- */
  const getServiceCertId = (stage, checkName, candId) =>
    `cert-${stage}-${checkName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${candId}`;

  /* ----------------------------------------------- */
  /* GENERATE INDIVIDUAL SERVICE CERTIFICATE */
  /* ----------------------------------------------- */
  const generateIndividualServiceCertificate = async (candidate, service, stage) => {
    const serviceKey = `${candidate._id}-${stage}-${service.checkName}`;
    setGeneratingCert(serviceKey);
    
    try {
      const certificateHtml = createPremiumServiceCertificateHTML(candidate, service, stage);
      const serviceName = SERVICE_NAMES[service.checkName] || formatServiceName(service.checkName || service.check);
      await downloadCertificatePDF(certificateHtml, candidate, `${serviceName}_Certificate`);
    } catch (err) {
      console.error("Failed to generate service certificate:", err);
      alert('Failed to generate service certificate. Please try again.');
    } finally {
      setGeneratingCert(null);
    }
  };

  /* ----------------------------------------------- */
  /* CREATE ENTERPRISE CERTIFICATE HTML - COMPLETE REPORT STYLE */
  /* ----------------------------------------------- */
  const createEnterpriseCertificateHTML = (candidate) => {
    const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel] || CERTIFICATE_TEMPLATES.VERIFIED;
    const verification = candidate.verification || {};
    
    // Calculate verification stats and collect all service details
    let totalChecks = 0;
    let completedChecks = 0;
    let failedChecks = 0;
    const stageStats = {};
    const allServices = [];
    
    Object.entries(verification.stages || {}).forEach(([stageName, stageData]) => {
      if (Array.isArray(stageData)) {
        const stageCompleted = stageData.filter(check => check.status === 'COMPLETED').length;
        const stageFailed = stageData.filter(check => check.status === 'FAILED').length;
        const stageTotal = stageData.length;
        
        stageStats[stageName] = {
          completed: stageCompleted,
          failed: stageFailed,
          total: stageTotal,
          percentage: stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0
        };
        
        totalChecks += stageTotal;
        completedChecks += stageCompleted;
        failedChecks += stageFailed;
        
        // Add services with full details
        stageData.forEach(check => {
          allServices.push({
            stage: stageName,
            name: SERVICE_NAMES[check.checkName] || formatServiceName(check.checkName || check.check),
            status: check.status || 'PENDING',
            checkName: check.checkName,
            result: check.result || {},
            attachments: check.attachments || [],
            timestamp: check.timestamp || check.createdAt,
            details: check.details || check.response || {},
            clientId: check.clientId,
            documentUrl: check.documentUrl,
            proofUrl: check.proofUrl
          });
        });
      }
    });
    
    const overallPercentage = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
    
    // Template colors
    const templateColors = {
      GOLD: { bg: '#fbbf24', text: '#000000', light: '#fef3c7' },
      SILVER: { bg: '#9ca3af', text: '#000000', light: '#f3f4f6' },
      BRONZE: { bg: '#f59e0b', text: '#000000', light: '#fef3c7' },
      VERIFIED: { bg: '#3b82f6', text: '#000000', light: '#dbeafe' }
    };
    
    const colors = templateColors[candidate.certificateLevel] || templateColors.VERIFIED;
    
    return `
      <div style="
        width: 1200px;
        min-height: 1600px;
        background: white;
        position: relative;
        font-family: 'Arial', sans-serif;
        padding: 40px;
        box-sizing: border-box;
        color: #000000;
      ">
        <!-- Header with Logo and Contact Info -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #000000;
          padding-bottom: 20px;
        ">
          <div style="display: flex; align-items: center; gap: 20px;">
            <img src="/logos/tfgLogo.jpeg" alt="TFG Reports" style="
              width: 80px;
              height: 80px;
              object-fit: contain;
            ">
            <div>
              <h1 style="
                font-size: 32px;
                font-weight: bold;
                color: #000000;
                margin: 0 0 5px 0;
              ">All Verification Reports</h1>
              <p style="
                font-size: 14px;
                color: #000000;
                margin: 0;
              ">Comprehensive Background Verification Summary</p>
            </div>
          </div>
          
          <div style="text-align: right; font-size: 12px; color: #000000;">
            <p style="margin: 0; color: #000000;">📞 +91-8235-279-810</p>
            <p style="margin: 5px 0 0 0; color: #000000;">✉️ info@tfgai.in</p>
            <p style="margin: 5px 0 0 0; color: #000000;">🌐 tfgai.in</p>
          </div>
        </div>

        <!-- Candidate Information Section -->
        <div style="
          background: #f9fafb;
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        ">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 20px 0;
            border-bottom: 1px solid #000000;
            padding-bottom: 10px;
          ">Candidate Information</h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Name:</strong> ${candidate.firstName} ${candidate.lastName}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Email:</strong> ${candidate.email}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Phone:</strong> ${candidate.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Candidate ID:</strong> ${candidate._id}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Verification ID:</strong> ${verification._id || 'N/A'}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Organization:</strong> ${selectedOrg?.organizationName || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <!-- Verification Summary Section -->
        <div style="margin-bottom: 30px;">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 20px 0;
            background: #f3f4f6;
            padding: 10px 15px;
            border-radius: 8px;
          ">Verification Summary</h4>
          
          <!-- Services Table with Full Details -->
          <table style="
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
            color: #000000;
          ">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: left;
                  font-weight: bold;
                  color: #000000;
                ">BGV Check</th>
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: left;
                  font-weight: bold;
                  color: #000000;
                ">Service</th>
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: bold;
                  color: #000000;
                ">Status</th>
              </tr>
            </thead>
            <tbody>
              ${allServices.map(service => `
                <tr>
                  <td style="
                    border: 1px solid #000000;
                    padding: 10px 8px;
                    text-transform: capitalize;
                    color: #000000;
                  ">${service.stage}</td>
                  <td style="
                    border: 1px solid #000000;
                    padding: 10px 8px;
                    color: #000000;
                  ">${service.name}</td>
                  <td style="
                    border: 1px solid #000000;
                    padding: 10px 8px;
                    text-align: center;
                    color: ${service.status === 'COMPLETED' ? '#059669' : service.status === 'FAILED' ? '#dc2626' : '#d97706'};
                    font-weight: bold;
                  ">${service.status === 'COMPLETED' ? '✓ Verified' : service.status === 'FAILED' ? '✗ Failed' : '⏳ Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Detailed Service Results -->
        ${Object.entries(stageStats).map(([stageName, stats]) => `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h3 style="
              font-size: 18px;
              font-weight: bold;
              color: #000000;
              margin: 0 0 20px 0;
              background: #e5e7eb;
              padding: 12px 15px;
              border-radius: 8px;
              text-transform: uppercase;
            ">${stageName} STAGE VERIFICATION DETAILS</h3>
            
            ${allServices.filter(s => s.stage === stageName).map(service => `
              <div style="
                background: #f9fafb;
                border: 2px solid #000000;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
              ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <h4 style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #000000;
                    margin: 0;
                  ">${service.name}</h4>
                  <span style="
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    background: ${service.status === 'COMPLETED' ? '#d1fae5' : service.status === 'FAILED' ? '#fee2e2' : '#fef3c7'};
                    color: ${service.status === 'COMPLETED' ? '#059669' : service.status === 'FAILED' ? '#dc2626' : '#d97706'};
                  ">${service.status === 'COMPLETED' ? '✓ Verified' : service.status === 'FAILED' ? '✗ Failed' : '⏳ Pending'}</span>
                </div>
                
                ${service.status === 'COMPLETED' && service.result ? `
                  <div style="margin-bottom: 15px;">
                    <h5 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Verification Results:</h5>
                    ${Object.entries(service.result).map(([key, value]) => `
                      <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                        <strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${service.details && Object.keys(service.details).length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h5 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Additional Details:</h5>
                    ${Object.entries(service.details).map(([key, value]) => `
                      <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                        <strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${service.clientId ? `
                  <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                    <strong>Client ID:</strong> ${service.clientId}
                  </p>
                ` : ''}
                
                ${service.timestamp ? `
                  <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                    <strong>Verification Timestamp:</strong> ${new Date(service.timestamp).toLocaleString()}
                  </p>
                ` : ''}
                
                ${service.documentUrl || service.proofUrl || (service.attachments && service.attachments.length > 0) ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #000000;">
                    <h5 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Attachments & Proofs:</h5>
                    ${service.documentUrl ? `
                      <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                        📄 <strong>Document:</strong> ${service.documentUrl}
                      </p>
                    ` : ''}
                    ${service.proofUrl ? `
                      <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                        📎 <strong>Proof:</strong> ${service.proofUrl}
                      </p>
                    ` : ''}
                    ${service.attachments && service.attachments.length > 0 ? `
                      ${service.attachments.map((attachment, idx) => `
                        <p style="margin: 5px 0; font-size: 12px; color: #000000;">
                          📎 <strong>Attachment ${idx + 1}:</strong> ${attachment.url || attachment.name || attachment}
                        </p>
                      `).join('')}
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}

        <!-- Summary Statistics -->
        <div style="
          background: #f9fafb;
          border: 2px solid #000000;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        ">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 15px 0;
          ">Verification Statistics</h4>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 5px 0;">
                ${completedChecks}
              </p>
              <p style="font-size: 12px; color: #000000; margin: 0;">Completed</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0 0 5px 0;">
                ${failedChecks}
              </p>
              <p style="font-size: 12px; color: #000000; margin: 0;">Failed</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #3b82f6; margin: 0 0 5px 0;">
                ${totalChecks}
              </p>
              <p style="font-size: 12px; color: #000000; margin: 0;">Total</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #8b5cf6; margin: 0 0 5px 0;">
                ${overallPercentage}%
              </p>
              <p style="font-size: 12px; color: #000000; margin: 0;">Success Rate</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #000000;">
            <p style="margin: 5px 0; font-size: 12px; color: #000000;">
              <strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p style="margin: 5px 0; font-size: 12px; color: #000000;">
              <strong>Certificate ID:</strong> TFG-${candidate._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          border-top: 2px solid #000000;
          padding-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #000000;
        ">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #dc2626;">
            TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081
          </p>
        </div>
      </div>
    `;
  };

  /* ----------------------------------------------- */
  /* DOWNLOAD CERTIFICATE PDF */
  /* ----------------------------------------------- */
  const downloadCertificatePDF = async (htmlContent, candidate, prefix = '') => {
    try {
      // Create temporary div
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.cssText = `
        position: fixed;
        top: -20000px;
        left: -20000px;
        width: 1200px;
        height: 1600px;
        z-index: -1;
        background: white;
      `;
      
      document.body.appendChild(tempDiv);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const certificateElement = tempDiv.firstElementChild;
      
      const canvas = await html2canvas(certificateElement, {
        width: 1200,
        height: 1600,
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1200, 1600],
        compress: true
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 1200, 1600, '', 'FAST');

      const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel] || CERTIFICATE_TEMPLATES.VERIFIED;
      const prefixText = prefix ? `${prefix}_` : '';
      const fileName = `TFG_Enterprise_${prefixText}${template.name.replace(' ', '_')}_Certificate_${candidate.firstName}_${candidate.lastName}.pdf`;
      
      pdf.save(fileName);
      document.body.removeChild(tempDiv);
      
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      
      // Fallback to simple PDF
      try {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel] || CERTIFICATE_TEMPLATES.VERIFIED;
        
        pdf.setFontSize(20);
        pdf.text('TFG REPORTS', 105, 30, { align: 'center' });
        pdf.setFontSize(16);
        pdf.text(`${template.name.toUpperCase()} CERTIFICATE`, 105, 50, { align: 'center' });
        pdf.setFontSize(18);
        pdf.text(`${candidate.firstName} ${candidate.lastName}`, 105, 80, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Email: ${candidate.email}`, 105, 100, { align: 'center' });
        pdf.text(`Completion Score: ${candidate.completionScore}%`, 105, 120, { align: 'center' });
        pdf.text(`Certificate ID: TFG-${candidate._id.slice(-8).toUpperCase()}`, 105, 250, { align: 'center' });
        pdf.text(`Issue Date: ${new Date().toLocaleDateString()}`, 105, 270, { align: 'center' });
        
        const fileName = `TFG_Enterprise_${template.name.replace(' ', '_')}_Certificate_${candidate.firstName}_${candidate.lastName}.pdf`;
        pdf.save(fileName);
        
      } catch (fallbackErr) {
        console.error('Fallback PDF generation failed:', fallbackErr);
        alert('Failed to generate certificate. Please try again.');
      }
    }
  };

  /* ----------------------------------------------- */
  /* STAGE-WISE ENTERPRISE CERTIFICATE GENERATION */
  /* ----------------------------------------------- */
  const generateStageCertificate = async (candidate, stageName, stageData) => {
    setGeneratingCert(`${candidate._id}-${stageName}`);
    
    try {
      const certificateHtml = createEnterpriseStageCertificateHTML(candidate, stageName, stageData);
      await downloadCertificatePDF(certificateHtml, candidate, `${stageName}_Stage`);
    } catch (err) {
      console.error('Failed to generate stage certificate:', err);
      alert('Failed to generate stage certificate. Please try again.');
    } finally {
      setGeneratingCert(null);
    }
  };

  /* ----------------------------------------------- */
  /* CREATE ENTERPRISE STAGE CERTIFICATE HTML - COMPLETE DETAILS */
  /* ----------------------------------------------- */
  const createEnterpriseStageCertificateHTML = (candidate, stageName, stageData) => {
    const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel] || CERTIFICATE_TEMPLATES.VERIFIED;
    const stageChecks = Array.isArray(stageData) ? stageData : [];
    const completedChecks = stageChecks.filter(check => check.status === 'COMPLETED');
    const failedChecks = stageChecks.filter(check => check.status === 'FAILED');
    const stageCompletion = stageChecks.length > 0 ? Math.round((completedChecks.length / stageChecks.length) * 100) : 0;
    
    return `
      <div style="
        width: 1200px;
        min-height: 1600px;
        background: white;
        position: relative;
        font-family: 'Arial', sans-serif;
        padding: 40px;
        box-sizing: border-box;
        color: #000000;
      ">
        <!-- Header with Logo and Contact Info -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #000000;
          padding-bottom: 20px;
        ">
          <div style="display: flex; align-items: center; gap: 20px;">
            <img src="/logos/tfgLogo.jpeg" alt="TFG Reports" style="
              width: 80px;
              height: 80px;
              object-fit: contain;
            ">
            <div>
              <h1 style="
                font-size: 32px;
                font-weight: bold;
                color: #000000;
                margin: 0 0 5px 0;
              ">${stageName.charAt(0).toUpperCase() + stageName.slice(1)} Report</h1>
              <p style="
                font-size: 14px;
                color: #000000;
                margin: 0;
              ">Verification Report</p>
            </div>
          </div>
          
          <div style="text-align: right; font-size: 12px; color: #000000;">
            <p style="margin: 0; color: #000000;">📞 +91-8235-279-810</p>
            <p style="margin: 5px 0 0 0; color: #000000;">✉️ info@tfgai.in</p>
            <p style="margin: 5px 0 0 0; color: #000000;">🌐 tfgai.in</p>
          </div>
        </div>

        <!-- Candidate Information -->
        <div style="
          background: #f9fafb;
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
        ">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 20px 0;
            border-bottom: 1px solid #000000;
            padding-bottom: 10px;
          ">Candidate Information</h4>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Candidate Name:</strong> ${candidate.firstName} ${candidate.lastName}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Candidate ID:</strong> ${candidate._id}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Verification ID:</strong> ${candidate.verification?._id || 'N/A'}
              </p>
            </div>
            <div>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Organization:</strong> ${selectedOrg?.organizationName || 'N/A'}
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Service:</strong> ${stageName.charAt(0).toUpperCase() + stageName.slice(1)} Report
              </p>
              <p style="margin: 8px 0; font-size: 14px; color: #000000;">
                <strong>Verification Timestamp:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
          
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #000000;">
            <p style="margin: 8px 0; font-size: 14px; color: #000000;">
              <strong>Status:</strong> <span style="color: #059669; font-weight: bold;">✓ ${stageCompletion >= 70 ? 'Completed' : 'Partially Completed'}</span>
            </p>
          </div>
        </div>

        <!-- Stage Progress Summary -->
        <div style="
          background: #f0f9ff;
          border: 2px solid #000000;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        ">
          <h4 style="
            font-size: 18px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 15px 0;
            text-align: center;
          ">${stageName.toUpperCase()} STAGE COMPLETION: ${stageCompletion}%</h4>
          
          <div style="
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 15px 0;
          ">
            <div style="
              width: ${stageCompletion}%;
              height: 100%;
              background: linear-gradient(90deg, #059669, #10b981);
              transition: width 0.3s ease;
            "></div>
          </div>
          
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #059669;">
                ${completedChecks.length}
              </p>
              <p style="margin: 0; font-size: 12px; color: #000000;">Completed</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #dc2626;">
                ${failedChecks.length}
              </p>
              <p style="margin: 0; font-size: 12px; color: #000000;">Failed</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #3b82f6;">
                ${stageChecks.length}
              </p>
              <p style="margin: 0; font-size: 12px; color: #000000;">Total</p>
            </div>
          </div>
        </div>

        <!-- Detailed Service Results -->
        <div style="margin-bottom: 30px;">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 20px 0;
            background: #f3f4f6;
            padding: 10px 15px;
            border-radius: 8px;
          ">${stageName.toUpperCase()} Stage Verification Details</h4>
          
          ${stageChecks.map((check, index) => {
            const serviceName = SERVICE_NAMES[check.checkName] || formatServiceName(check.checkName || check.check);
            const status = check.status || 'PENDING';
            
            return `
              <div style="
                background: #f9fafb;
                border: 2px solid #000000;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                page-break-inside: avoid;
              ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <h5 style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #000000;
                    margin: 0;
                  ">${serviceName}</h5>
                  <span style="
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    background: ${status === 'COMPLETED' ? '#d1fae5' : status === 'FAILED' ? '#fee2e2' : '#fef3c7'};
                    color: ${status === 'COMPLETED' ? '#059669' : status === 'FAILED' ? '#dc2626' : '#d97706'};
                  ">${status === 'COMPLETED' ? '✓ Verified' : status === 'FAILED' ? '✗ Failed' : '⏳ Pending'}</span>
                </div>
                
                ${status === 'COMPLETED' && check.result ? `
                  <div style="margin-bottom: 15px;">
                    <h6 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Verification Results:</h6>
                    ${Object.entries(check.result).map(([key, value]) => `
                      <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #000000;">
                          <strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> 
                          ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </p>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${check.details && Object.keys(check.details).length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h6 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Additional Details:</h6>
                    ${Object.entries(check.details).map(([key, value]) => `
                      <div style="margin: 8px 0; padding: 8px; background: white; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #000000;">
                          <strong>${key.replace(/_/g, ' ').toUpperCase()}:</strong> 
                          ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </p>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${check.response && Object.keys(check.response).length > 0 ? `
                  <div style="margin-bottom: 15px;">
                    <h6 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">API Response:</h6>
                    <div style="background: white; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 11px; color: #000000; overflow-wrap: break-word;">
                      ${JSON.stringify(check.response, null, 2)}
                    </div>
                  </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                  ${check.clientId ? `
                    <p style="margin: 0; font-size: 12px; color: #000000; background: white; padding: 8px; border-radius: 4px;">
                      <strong>Client ID:</strong> ${check.clientId}
                    </p>
                  ` : ''}
                  
                  ${check.timestamp || check.createdAt ? `
                    <p style="margin: 0; font-size: 12px; color: #000000; background: white; padding: 8px; border-radius: 4px;">
                      <strong>Timestamp:</strong> ${new Date(check.timestamp || check.createdAt).toLocaleString()}
                    </p>
                  ` : ''}
                </div>
                
                ${check.documentUrl || check.proofUrl || (check.attachments && check.attachments.length > 0) ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #000000;">
                    <h6 style="font-size: 14px; font-weight: bold; color: #000000; margin: 0 0 10px 0;">Please find the proof of this verification as attachments:</h6>
                    
                    ${check.documentUrl ? `
                      <div style="margin: 8px 0; padding: 8px; background: #e0f2fe; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #000000;">
                          📄 <strong>View ${serviceName} (PDF)</strong>
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #000000; word-break: break-all;">
                          ${check.documentUrl}
                        </p>
                      </div>
                    ` : ''}
                    
                    ${check.proofUrl ? `
                      <div style="margin: 8px 0; padding: 8px; background: #e0f2fe; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #000000;">
                          📎 <strong>Verification Proof</strong>
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #000000; word-break: break-all;">
                          ${check.proofUrl}
                        </p>
                      </div>
                    ` : ''}
                    
                    ${check.attachments && check.attachments.length > 0 ? `
                      ${check.attachments.map((attachment, idx) => `
                        <div style="margin: 8px 0; padding: 8px; background: #e0f2fe; border-radius: 4px;">
                          <p style="margin: 0; font-size: 12px; color: #000000;">
                            📎 <strong>Attachment ${idx + 1}:</strong> ${attachment.name || `Document_${idx + 1}`}
                          </p>
                          <p style="margin: 5px 0 0 0; font-size: 11px; color: #000000; word-break: break-all;">
                            ${attachment.url || attachment.path || attachment}
                          </p>
                        </div>
                      `).join('')}
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Summary Table -->
        <div style="margin-bottom: 30px;">
          <h4 style="
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 15px 0;
          ">Verification Summary Table</h4>
          
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            color: #000000;
          ">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: left;
                  font-weight: bold;
                ">Service Name</th>
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: bold;
                ">Status</th>
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: bold;
                ">Verification Date</th>
                <th style="
                  border: 1px solid #000000;
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: bold;
                ">Client ID</th>
              </tr>
            </thead>
            <tbody>
              ${stageChecks.map(check => {
                const serviceName = SERVICE_NAMES[check.checkName] || formatServiceName(check.checkName || check.check);
                const status = check.status || 'PENDING';
                
                return `
                  <tr>
                    <td style="
                      border: 1px solid #000000;
                      padding: 10px 8px;
                      color: #000000;
                    ">${serviceName}</td>
                    <td style="
                      border: 1px solid #000000;
                      padding: 10px 8px;
                      text-align: center;
                      color: ${status === 'COMPLETED' ? '#059669' : status === 'FAILED' ? '#dc2626' : '#d97706'};
                      font-weight: bold;
                    ">${status === 'COMPLETED' ? '✓ Verified' : status === 'FAILED' ? '✗ Failed' : '⏳ Pending'}</td>
                    <td style="
                      border: 1px solid #000000;
                      padding: 10px 8px;
                      text-align: center;
                      font-size: 11px;
                      color: #000000;
                    ">${check.timestamp ? new Date(check.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    <td style="
                      border: 1px solid #000000;
                      padding: 10px 8px;
                      text-align: center;
                      font-size: 11px;
                      color: #000000;
                    ">${check.clientId || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="
          border-top: 2px solid #000000;
          padding-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #000000;
        ">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #dc2626;">
            TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081
          </p>
        </div>
      </div>
    `;
  };

  const toggle = (id) => setExpandedCandidate((prev) => (prev === id ? null : id));

  /* ----------------------------------------------- */
  /* INDIVIDUAL SERVICE CERTIFICATE COMPONENT - LIKE REPORTS PAGE */
  /* ----------------------------------------------- */
  const ServiceCertificate = ({ id, candidate, orgName, check, stage }) => {
    const checks = [{ ...check, stage }];
    const serviceName = SERVICE_NAMES[check.checkName || check.check] || formatServiceName(check.checkName || check.check);
    const title = `${stage.toUpperCase()} - ${serviceName} Verification Report`;

    return (
      <CertificateBase
        id={id}
        title={title}
        candidate={candidate}
        orgName={orgName}
        checks={checks}
      />
    );
  };

  /* ----------------------------------------------- */
  /* PREMIUM CERTIFICATE BASE TEMPLATE - ENHANCED DESIGN */
  /* ----------------------------------------------- */
const CertificateBase = ({ id, candidate, orgName, checks }) => {
  const check = checks?.[0] || {};
  const verification = candidate.verification;

  const serviceName =
    check.checkName || check.check || "Background Verification";

  const STATUS_MAP = {
    COMPLETED: { label: "VERIFIED", color: "#14532d" },
    FAILED: { label: "NOT VERIFIED", color: "#7f1d1d" },
    PENDING: { label: "IN PROGRESS", color: "#78350f" },
  };

  const status = STATUS_MAP[check.status] || STATUS_MAP.PENDING;

  /* -------- INTERPRETED SUMMARY (NOT RAW DATA) -------- */
  const buildSummary = () => {
    if (check.status === "COMPLETED") {
      return `Based on the information and documents reviewed, the verification has been completed successfully. No material discrepancies were identified that would adversely impact the verification outcome.`;
    }

    if (check.status === "FAILED") {
      return `The verification process identified certain discrepancies or adverse findings. As a result, the verification could not be successfully completed.`;
    }

    return `The verification process is currently in progress and is subject to completion upon receipt and validation of all required information.`;
  };

  /* -------- FINDINGS (PARSED BUT FORMAL) -------- */
  const findings = [];
  const remarks = check.remarks || check.result;

  if (typeof remarks === "string") {
    findings.push(remarks);
  } else if (Array.isArray(remarks)) {
    remarks.forEach(r => findings.push(String(r)));
  } else if (typeof remarks === "object" && remarks) {
    Object.entries(remarks)
      .slice(0, 6)
      .forEach(([k, v]) => {
        findings.push(`${k.replace(/_/g, " ")}: ${String(v)}`);
      });
  }

  return (
    <div
      id={id}
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "70px 80px",
        background: "#ffffff",
        fontFamily: "Times New Roman, Georgia, serif",
        color: "#111827",
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* ================= HEADER ================= */}
      <img
        src="/logos/tfgLogo.jpeg"
        alt="logo"
        style={{ height: "80px", marginBottom: "40px" }}
      />

      <h1
        style={{
          fontSize: "28px",
          letterSpacing: "1.2px",
          marginBottom: "40px",
        }}
      >
        CERTIFICATE OF VERIFICATION
      </h1>

      {/* ================= BODY ================= */}
      <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
        This is to certify that
      </p>

      <p
        style={{
          fontSize: "22px",
          fontWeight: "700",
          margin: "18px 0",
          textTransform: "uppercase",
        }}
      >
        {candidate.firstName} {candidate.lastName}
      </p>

      <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
        has undergone
      </p>

      <p
        style={{
          fontSize: "18px",
          fontWeight: "600",
          margin: "18px 0",
        }}
      >
        {serviceName}
      </p>

      <p style={{ fontSize: "16px", lineHeight: "1.8" }}>
        conducted by
      </p>

      <p style={{ fontSize: "17px", fontWeight: "600" }}>{orgName}</p>

      {/* ================= RESULT ================= */}
      <div
        style={{
          margin: "40px auto",
          padding: "14px 26px",
          border: `2px solid ${status.color}`,
          display: "inline-block",
          fontWeight: "700",
          fontSize: "16px",
          color: status.color,
          letterSpacing: "0.6px",
        }}
      >
        RESULT: {status.label}
      </div>

      {/* ================= SUMMARY ================= */}
      <p
        style={{
          fontSize: "15px",
          lineHeight: "1.9",
          marginTop: "20px",
          marginBottom: "50px",
          textAlign: "justify",
        }}
      >
        {buildSummary()}
      </p>

      {/* ================= DETAILS ================= */}
      <div style={{ textAlign: "left", marginTop: "30px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
          Verification Details
        </h3>

        <p><strong>Candidate ID:</strong> {candidate._id}</p>
        <p><strong>Verification ID:</strong> {verification?._id || "—"}</p>
        <p><strong>Date of Issue:</strong> {new Date().toLocaleDateString()}</p>

        {findings.length > 0 && (
          <>
            <p style={{ marginTop: "18px", fontWeight: "600" }}>
              Key Findings:
            </p>
            <ul style={{ marginLeft: "18px" }}>
              {findings.map((f, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ================= AUTHORITY ================= */}
      <div
        style={{
          marginTop: "80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ height: "1px", width: "200px", background: "#000" }} />
          <p style={{ marginTop: "6px" }}>Authorized Signatory</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ height: "1px", width: "200px", background: "#000" }} />
          <p style={{ marginTop: "6px" }}>Official Seal</p>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <p
        style={{
          position: "absolute",
          bottom: "40px",
          left: "80px",
          right: "80px",
          fontSize: "11px",
          color: "#374151",
        }}
      >
        This certificate is system-generated and issued by TFG AI powered IT solutions
        Private Limited for verification purposes only.
      </p>
    </div>
  );
};


/* ================= COMPONENTS ================= */

const Grid = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px 40px",
      fontSize: "14px",
    }}
  >
    {children}
  </div>
);

const Item = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "12px", color: "#64748b" }}>{label}</div>
    <div style={{ fontWeight: 600 }}>{value}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
      {title}
    </div>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ fontSize: "14px", marginBottom: "10px" }}>{children}</div>
);

const Divider = () => (
  <div style={{ height: "1px", background: "#e5e7eb", margin: "32px 0" }} />
);


  /* ----------------------------------------------- */
  /* FILTERED CANDIDATES */
  /* ----------------------------------------------- */
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidateSearch === "" || 
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      candidate.email.toLowerCase().includes(candidateSearch.toLowerCase());
    
    const matchesTemplate = filterTemplate === "ALL" || candidate.certificateLevel === filterTemplate;
    
    return matchesSearch && matchesTemplate && candidate.certificateLevel;
  });

  /* ----------------------------------------------- */
  /* RENDER */
  /* ----------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enterprise Certificates</h1>
              <p className="text-gray-600">Generate professional verification certificates</p>
            </div>
            {/* Refresh Button */}
            <button
              onClick={() => {
                if (selectedOrg) {
                  fetchCandidates(selectedOrg._id, true); // Force refresh
                }
              }}
              disabled={loading || !selectedOrg}
              className={`ml-4 p-3 rounded-xl transition-all duration-300 ${
                loading || !selectedOrg
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
              }`}
              title="Refresh Certificates & Verifications"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <RefreshCcw size={20} />
              )}
            </button>
          </div>

          {/* Certificate Templates Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(CERTIFICATE_TEMPLATES).map(([key, template]) => {
              const IconComponent = template.icon;
              return (
                <div key={key} className={`${template.bgColor} ${template.borderColor} border-2 rounded-2xl p-4 text-center`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <span className="text-xs font-semibold text-gray-500">{template.minScore}%+ Score</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organization Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Select Organization</h2>
          </div>
          
          <div className="relative">
            <div
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="border-2 border-gray-200 rounded-xl p-4 bg-white cursor-pointer flex justify-between items-center hover:border-blue-300 transition-all"
            >
              <span className="font-medium text-gray-700">
                {selectedOrg ? selectedOrg.organizationName : "Choose an organization"}
              </span>
              <ChevronDown size={20} className="text-gray-400" />
            </div>

            {showOrgDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-2 z-50 max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="🔍 Search organization..."
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {organizations
                  .filter(org => 
                    org.organizationName.toLowerCase().includes(orgSearch.toLowerCase())
                  )
                  .map(org => (
                    <div
                      key={org._id}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-medium transition-all border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setSelectedOrg(org);
                        setShowOrgDropdown(false);
                        fetchCandidates(org._id);
                        setOrgSearch("");
                      }}
                    >
                      🏢 {org.organizationName}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {selectedOrg && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="lg:w-64">
                <select
                  value={filterTemplate}
                  onChange={(e) => setFilterTemplate(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Certificates</option>
                  {Object.entries(CERTIFICATE_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>{template.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading candidates...</p>
          </div>
        )}

        {/* Candidates Grid */}
        {!loading && selectedOrg && (
          <div className="space-y-6">
            {filteredCandidates.map((candidate, index) => {
              const template = CERTIFICATE_TEMPLATES[candidate.certificateLevel];
              const IconComponent = template.icon;
              const isExpanded = expandedCandidate === candidate._id;
              
              // Get stage data from verification
              const v = candidate.verification || {};
              const primaryChecks = v?.stages?.primary || [];
              const secondaryChecks = v?.stages?.secondary || [];
              const finalChecks = v?.stages?.final || [];
              
              const totalChecks = primaryChecks.length + secondaryChecks.length + finalChecks.length;
              const completedChecks = [...primaryChecks, ...secondaryChecks, ...finalChecks].filter(chk => chk.status === "COMPLETED").length;
              const failedChecks = [...primaryChecks, ...secondaryChecks, ...finalChecks].filter(chk => chk.status === "FAILED").length;
              
              return (
                <div 
                  key={candidate._id} 
                  className="group relative mb-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div
                      className="p-6 cursor-pointer bg-gradient-to-r from-transparent via-white/20 to-transparent hover:from-blue-500/5 hover:via-indigo-500/3 hover:to-purple-500/5 transition-all duration-300"
                      onClick={() => toggle(candidate._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-16 h-16 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                              <IconComponent size={32} className="text-white" />
                            </div>
                            {v?.overallStatus === "COMPLETED" && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle size={14} className="text-white" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-gray-900">
                                {candidate.firstName} {candidate.lastName}
                              </h3>
                              <span className={`px-3 py-1 bg-gradient-to-r ${template.color} text-white text-xs font-bold rounded-full shadow-lg`}>
                                {template.name}
                              </span>
                              {failedChecks > 0 && (
                                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">
                                  <XCircle size={12} />
                                  {failedChecks} Issues
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Email:</span>
                                <span className="text-blue-600">{candidate.email}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Score:</span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                                  {candidate.completionScore}%
                                </span>
                              </div>
                              
                              {totalChecks > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                      style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">
                                    {completedChecks}/{totalChecks}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quick Actions */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateCertificate(candidate);
                            }}
                            disabled={generatingCert === candidate._id}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                          >
                            {generatingCert === candidate._id ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                Certificate
                              </>
                            )}
                          </button>
                          
                          <div className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                            isExpanded
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
                              : "bg-white/80 text-gray-600 hover:bg-gray-100"
                          }`}>
                            <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                              <ChevronDown size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200/50 bg-gradient-to-b from-transparent to-gray-50/30">
                        <div className="p-6 space-y-6">
                          {/* HIDDEN INDIVIDUAL SERVICE CERTIFICATES - invisible DOM for PDF generation */}
                          <div className="absolute -left-[9999px] -top-[9999px]">
                            {primaryChecks.map((chk) => (
                              <ServiceCertificate
                                key={getServiceCertId("primary", chk.checkName || chk.check, candidate._id)}
                                id={getServiceCertId("primary", chk.checkName || chk.check, candidate._id)}
                                candidate={candidate}
                                orgName={selectedOrg?.organizationName || 'N/A'}
                                check={chk}
                                stage="primary"
                              />
                            ))}
                            {secondaryChecks.map((chk) => (
                              <ServiceCertificate
                                key={getServiceCertId("secondary", chk.checkName || chk.check, candidate._id)}
                                id={getServiceCertId("secondary", chk.checkName || chk.check, candidate._id)}
                                candidate={candidate}
                                orgName={selectedOrg?.organizationName || 'N/A'}
                                check={chk}
                                stage="secondary"
                              />
                            ))}
                            {finalChecks.map((chk) => (
                              <ServiceCertificate
                                key={getServiceCertId("final", chk.checkName || chk.check, candidate._id)}
                                id={getServiceCertId("final", chk.checkName || chk.check, candidate._id)}
                                candidate={candidate}
                                orgName={selectedOrg?.organizationName || 'N/A'}
                                check={chk}
                                stage="final"
                              />
                            ))}
                          </div>

                          {/* Stage Sections */}
                          {primaryChecks.length > 0 && (
                            <CertificateStageSection
                              title="Primary Services"
                              checks={primaryChecks}
                              candidate={candidate}
                              stage="primary"
                              generatingCert={generatingCert}
                              generateStageCertificate={generateStageCertificate}
                              downloadSingleServiceCert={downloadSingleServiceCert}
                              getServiceCertId={getServiceCertId}
                            />
                          )}

                          {secondaryChecks.length > 0 && (
                            <CertificateStageSection
                              title="Secondary Services"
                              checks={secondaryChecks}
                              candidate={candidate}
                              stage="secondary"
                              generatingCert={generatingCert}
                              generateStageCertificate={generateStageCertificate}
                              downloadSingleServiceCert={downloadSingleServiceCert}
                              getServiceCertId={getServiceCertId}
                            />
                          )}

                          {finalChecks.length > 0 && (
                            <CertificateStageSection
                              title="Final Services"
                              checks={finalChecks}
                              candidate={candidate}
                              stage="final"
                              generatingCert={generatingCert}
                              generateStageCertificate={generateStageCertificate}
                              downloadSingleServiceCert={downloadSingleServiceCert}
                              getServiceCertId={getServiceCertId}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredCandidates.length === 0 && !loading && (
              <div className="text-center py-16">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No candidates found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------- */
/* CERTIFICATE STAGE SECTION COMPONENT - WITH INDIVIDUAL DOWNLOADS */
/* ----------------------------------------------- */
function CertificateStageSection({ title, checks, candidate, stage, generatingCert, generateStageCertificate, downloadSingleServiceCert, getServiceCertId }) {
  const [open, setOpen] = useState(false);

  const stageConfig = {
    "Primary Services": {
      num: 1,
      icon: "🚀",
      gradient: "from-blue-400 via-indigo-500 to-purple-600",
      bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
      textGradient: "from-blue-600 to-purple-700",
    },
    "Secondary Services": {
      num: 2,
      icon: "⚡",
      gradient: "from-orange-400 via-amber-500 to-yellow-600",
      bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
      textGradient: "from-orange-600 to-yellow-700",
    },
    "Final Services": {
      num: 3,
      icon: "🎯",
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      bgGradient: "from-green-50 via-emerald-50 to-teal-50",
      textGradient: "from-green-600 to-teal-700",
    },
  };

  const config = stageConfig[title] || stageConfig["Primary Services"];
  const completedCount = checks.filter(chk => chk.status === "COMPLETED").length;
  const failedCount = checks.filter(chk => chk.status === "FAILED").length;

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
      
      <div className="relative">
        <div
          onClick={() => setOpen((p) => !p)}
          className={`w-full flex justify-between items-center bg-gradient-to-r ${config.bgGradient} border-2 border-transparent bg-clip-padding px-6 py-5 rounded-3xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] group cursor-pointer`}
        >
          <div className="flex items-center gap-4">
            <div className={`relative w-14 h-14 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-xl">{config.icon}</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shadow-md">
                {config.num}
              </div>
            </div>
            
            <div className="text-left">
              <h3 className={`text-xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}>
                {title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-600 font-medium">
                  {checks.length} services
                </span>
                {completedCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✅ {completedCount} completed
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                    ❌ {failedCount} failed
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stage Certificate Download */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                generateStageCertificate(candidate, stage, checks);
              }}
              className={`bg-gradient-to-r ${config.gradient} text-white py-2 px-4 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer ${generatingCert === `${candidate._id}-${stage}` ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {generatingCert === `${candidate._id}-${stage}` ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award size={16} />
                  Stage Certificate
                </>
              )}
            </div>
            
            <div className={`p-3 bg-white/50 rounded-2xl transition-all duration-300 ${open ? "rotate-180 bg-white/80" : "group-hover:bg-white/70"}`}>
              <ChevronDown size={20} className="text-slate-700" />
            </div>
          </div>
        </div>

        {open && (
          <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {checks.map((chk, index) => {
                const done = chk.status === "COMPLETED";
                const failed = chk.status === "FAILED";
                const pending = chk.status === "PENDING";
                const certId = getServiceCertId(stage, chk.checkName || chk.check, candidate._id);
                const serviceName = SERVICE_NAMES[chk.checkName || chk.check] || formatServiceName(chk.checkName || chk.check);

                return (
                  <div
                    key={`${stage}-${chk.checkName || chk.check}-${index}`}
                    className="relative group/card bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-3 right-3">
                      {done && <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>}
                      {failed && <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>}
                      {pending && <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div>}
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-xl shadow-md ${
                        done ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                        failed ? "bg-gradient-to-br from-red-500 to-pink-500" :
                        "bg-gradient-to-br from-slate-400 to-slate-500"
                      }`}>
                        <span className="text-lg text-white">
                          {SERVICE_ICONS[chk.checkName || chk.check] || "📝"}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">
                          {serviceName}
                        </h4>
                        <p className={`text-xs font-semibold mt-1 ${
                          done ? "text-green-600" :
                          failed ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {done ? "✅ Completed" :
                           failed ? "❌ Failed" :
                           "⏳ Pending"}
                        </p>
                      </div>
                    </div>

                    {/* Individual Service Download Button */}
                    <button
                      disabled={!done || generatingCert === `${candidate._id}-${stage}-${chk.checkName || chk.check}`}
                      onClick={() => {
                        const fileName = `TFG_${serviceName.replace(/\s+/g, '_')}_${candidate.firstName}_${candidate.lastName}.pdf`;
                        downloadSingleServiceCert(certId, fileName, candidate, chk, stage);
                      }}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                        done
                          ? `bg-gradient-to-r ${config.gradient} text-white hover:shadow-xl hover:scale-105 shadow-lg`
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      } ${generatingCert === `${candidate._id}-${stage}-${chk.checkName || chk.check}` ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {generatingCert === `${candidate._id}-${stage}-${chk.checkName || chk.check}` ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          <span>Download Certificate</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
