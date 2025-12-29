"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import {
  Shield,
  Brain,
  Users,
  FileCheck,
  Lock,
  CheckCircle,
  CreditCard,
  MapPin,
  GraduationCap,
  UserCheck,
  FileText,
  Building,
  Sparkles,
  Zap,
  TrendingUp,
  Eye,
  ArrowRight,
  Globe,
  Clock,
  Award,
  Database,
  Cpu,
  Network,
  ChevronDown,
  Play,
  CheckSquare,
  Rocket,
  Download,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);
  const [redirecting, setRedirecting] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("bgvUser");
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bgvTemp="));

    if (storedUser && tokenCookie) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();

        if (
          ["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)
        ) {
          router.replace("/superadmin/dashboard");
          return;
        }

        if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)) {
          router.replace("/org/dashboard");
          return;
        }
      } catch {
        localStorage.removeItem("bgvUser");
      }
    }

    setShowLanding(true);
    setRedirecting(false);
  }, [router]);

  // Sample Report Generation Function
  const generateSampleReport = async () => {
    if (generatingReport) return; // Prevent multiple clicks
    
    setGeneratingReport(true);
    try {
      // Create sample data
      const sampleCandidate = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+91-9876543210",
        _id: "sample123456789"
      };

      const sampleOrganization = "TFG AI Solutions";

      const sampleChecks = [
        { 
          checkName: "pan_verification", 
          status: "COMPLETED", 
          stage: "Primary", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          apiResponse: { 
            status: "VALID", 
            pan_number: "ABCDE1234F", 
            name_match: "EXACT",
            date_of_birth: "15/08/1995",
            father_name: "ROBERT DOE"
          }
        },
        { 
          checkName: "employment_history", 
          status: "COMPLETED", 
          stage: "Primary", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          apiResponse: { 
            company: "Tech Solutions Pvt Ltd", 
            designation: "Software Engineer", 
            duration: "2 years 3 months",
            employment_type: "Full Time",
            last_working_day: "31/12/2023",
            hr_contact: "hr@techsolutions.com"
          }
        },
        { 
          checkName: "education_check_manual", 
          status: "COMPLETED", 
          stage: "Secondary", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          apiResponse: { 
            degree: "B.Tech Computer Science", 
            university: "ABC University", 
            year: "2020", 
            status: "VERIFIED",
            cgpa: "8.5/10",
            registration_number: "ABC123456789"
          }
        },
        { 
          checkName: "court_record", 
          status: "COMPLETED", 
          stage: "Secondary", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          apiResponse: { 
            criminal_records: "CLEAR", 
            civil_records: "CLEAR", 
            status: "NO_RECORDS_FOUND",
            courts_searched: ["District Court", "High Court", "Supreme Court"],
            search_period: "Last 7 years"
          }
        },
        { 
          checkName: "credit_report", 
          status: "COMPLETED", 
          stage: "Final", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          apiResponse: { 
            credit_score: 750, 
            status: "GOOD", 
            total_accounts: 3, 
            overdue_amount: 0,
            credit_history_length: "5 years",
            payment_history: "100% on time"
          }
        },
        { 
          checkName: "address_verification", 
          status: "COMPLETED", 
          stage: "Final", 
          completedAt: new Date().toISOString(),
          initiatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          apiResponse: { 
            address_match: "CONFIRMED", 
            verification_method: "FIELD_VISIT", 
            status: "VERIFIED",
            address: "123 Tech Park, Bangalore, Karnataka 560001",
            resident_since: "2 years",
            verification_agent: "Agent ID: TFG001"
          }
        }
      ];

      // Create a new jsPDF instance
      let pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Generate Index Page first
      const indexDiv = document.createElement("div");
      indexDiv.id = "temp-index-page";
      indexDiv.style.position = "absolute";
      indexDiv.style.left = "-9999px";
      indexDiv.style.top = "0";
      indexDiv.style.width = "860px";
      indexDiv.style.minHeight = "1120px";
      indexDiv.style.visibility = "visible";
      indexDiv.style.backgroundColor = "#ffffff";
      indexDiv.style.fontFamily = "Arial, sans-serif";
      indexDiv.style.color = "#000";
      document.body.appendChild(indexDiv);

      // Build verification summary table rows
      const tableRows = sampleChecks.map((chk, index) => {
        const serviceName = chk.checkName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return '<tr style="background: ' + (index % 2 === 0 ? "#ffffff" : "#f9f9f9") + ';">' +
          '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + chk.stage + '</td>' +
          '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + serviceName + '</td>' +
          '<td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #22c55e; border-bottom: 1px solid #e0e0e0;">✓ Verified</td>' +
          '</tr>';
      }).join("");

      indexDiv.innerHTML = 
        '<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">' +
        '<img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />' +
        '<div style="position: relative; z-index: 2;">' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">' +
        '<div style="flex-shrink: 0; margin-top: 5px;"><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" /></div>' +
        '<div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 55px; flex: 1; padding: 0 20px;"><h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 0 0 8px 0; line-height: 1.3;">TFG Enterprise Gold Certificate</h1><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.4;">Comprehensive Background Verification Certificate</p></div>' +
        '<div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 12px; color: #333; line-height: 1.8;"><p style="margin: 0 0 5px 0; font-weight: bold;">📞 +91-8235-279-810</p><p style="margin: 0 0 5px 0;">✉ info@tfgai.in</p><p style="margin: 0;">🌐 tfgai.in</p></div>' +
        '</div>' +
        '<div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 10px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Candidate Information</h2>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.firstName + ' ' + sampleCandidate.lastName + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Email:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.email + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Phone:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.phone + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Organization:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleOrganization + '</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Certificate Level:</td><td style="padding: 8px 0; font-size: 13px; color: #000; font-weight: bold;">Gold Certificate</td></tr>' +
        '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Completion Score:</td><td style="padding: 8px 0; font-size: 13px; color: #000; font-weight: bold;">100%</td></tr>' +
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
        '<p style="margin: 5px 0;">Total Verifications: ' + sampleChecks.length + '</p>' +
        '<p style="margin: 5px 0;">Completed: ' + sampleChecks.filter((c) => c.status === "COMPLETED").length + '</p>' +
        '<p style="margin: 5px 0;">Certificate ID: TFG-SAMPLE-DEMO</p>' +
        '</div><div style="margin-top: 120px; padding-top: 15px; border-top: 2px solid #272626ff; font-size: 12px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">' +
        '<p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>' +
        '</div></div></div></div>';

      // Wait for images to load and proper rendering
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate PDF for index page
      const indexCanvas = await safeHtml2Canvas(indexDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 860,
        height: 1120,
      });

      if (!indexCanvas || indexCanvas.width === 0 || indexCanvas.height === 0) {
        throw new Error('Failed to generate index page canvas');
      }

      const indexImgData = indexCanvas.toDataURL("image/png", 1.0);
      
      if (!indexImgData || !indexImgData.startsWith('data:image/png;base64,')) {
        throw new Error('Failed to generate index page image');
      }

      // Create PDF with proper A4 dimensions
      pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Add index page to PDF with proper scaling
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = indexCanvas.width * 0.75;
      const imgHeight = indexCanvas.height * 0.75;
      
      // Scale to fit page while maintaining aspect ratio
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      pdf.addImage(indexImgData, "PNG", x, y, scaledWidth, scaledHeight);
      document.body.removeChild(indexDiv);

      // Generate individual service certificates
      for (let i = 0; i < sampleChecks.length; i++) {
        const check = sampleChecks[i];
        const serviceName = check.checkName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Create individual service certificate
        const serviceDiv = document.createElement("div");
        serviceDiv.id = `temp-service-${i}`;
        serviceDiv.style.position = "absolute";
        serviceDiv.style.left = "-9999px";
        serviceDiv.style.top = "0";
        serviceDiv.style.width = "860px";
        serviceDiv.style.minHeight = "1120px";
        serviceDiv.style.visibility = "visible";
        serviceDiv.style.backgroundColor = "#ffffff";
        serviceDiv.style.fontFamily = "Arial, sans-serif";
        serviceDiv.style.color = "#000";
        document.body.appendChild(serviceDiv);

        // Format API response for display
        const formatApiResponse = (data) => {
          if (!data) return "No data available";
          return JSON.stringify(data, null, 2);
        };

        serviceDiv.innerHTML = 
          '<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">' +
          '<img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />' +
          '<div style="position: relative; z-index: 2;">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">' +
          '<div style="flex-shrink: 0; margin-top: 5px;"><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" /></div>' +
          '<div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 55px; flex: 1; padding: 0 20px;"><h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 0 0 8px 0; line-height: 1.3;">TFG Enterprise Service Certificate</h1><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.4;">' + serviceName + ' Verification Report</p></div>' +
          '<div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 12px; color: #333; line-height: 1.8;"><p style="margin: 0 0 5px 0; font-weight: bold;">📞 +91-8235-279-810</p><p style="margin: 0 0 5px 0;">✉ info@tfgai.in</p><p style="margin: 0;">🌐 tfgai.in</p></div>' +
          '</div>' +
          '<div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Candidate Information</h2>' +
          '<table style="width: 100%; border-collapse: collapse;">' +
          '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.firstName + ' ' + sampleCandidate.lastName + '</td></tr>' +
          '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Email:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.email + '</td></tr>' +
          '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Phone:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleCandidate.phone + '</td></tr>' +
          '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">Organization:</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + sampleOrganization + '</td></tr>' +
          '</table></div>' +
          '<div style="margin-bottom: 20px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Service Verification Details</h2>' +
          '<table style="width: 100%; border-collapse: collapse; border: 2px solid #e0e0e0;">' +
          '<tr style="background: #f0f0f0;"><td style="padding: 12px; font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd; width: 30%;">Service Name</td><td style="padding: 12px; font-size: 13px; color: #000; border-bottom: 1px solid #ddd;">' + serviceName + '</td></tr>' +
          '<tr><td style="padding: 12px; font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd;">Status</td><td style="padding: 12px; font-size: 13px; color: #22c55e; border-bottom: 1px solid #ddd; font-weight: bold;">✓ VERIFIED</td></tr>' +
          '<tr style="background: #f9f9f9;"><td style="padding: 12px; font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd;">Stage</td><td style="padding: 12px; font-size: 13px; color: #000; border-bottom: 1px solid #ddd;">' + check.stage + '</td></tr>' +
          '<tr><td style="padding: 12px; font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd;">Initiated</td><td style="padding: 12px; font-size: 13px; color: #000; border-bottom: 1px solid #ddd;">' + new Date(check.initiatedAt).toLocaleString() + '</td></tr>' +
          '<tr style="background: #f9f9f9;"><td style="padding: 12px; font-size: 13px; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; border-right: 1px solid #ddd;">Completed</td><td style="padding: 12px; font-size: 13px; color: #000; border-bottom: 1px solid #ddd;">' + new Date(check.completedAt).toLocaleString() + '</td></tr>' +
          '</table></div>' +
          '<div style="margin-bottom: 20px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Verification Response Data</h2>' +
          '<div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; font-size: 12px; font-family: monospace; color: #000; white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow: auto;">' + formatApiResponse(check.apiResponse) + '</div></div>' +
          '<div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;"><div style="font-size: 11px; color: #666; margin-bottom: 15px;">' +
          '<p style="margin: 5px 0;">Generated on: ' + new Date().toLocaleString() + '</p>' +
          '<p style="margin: 5px 0;">Service ID: ' + check.checkName + '</p>' +
          '<p style="margin: 5px 0;">Certificate ID: TFG-SAMPLE-' + check.stage.toUpperCase() + '-' + i + '</p>' +
          '</div><div style="margin-top: 120px; padding-top: 15px; border-top: 2px solid #272626ff; font-size: 12px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">' +
          '<p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>' +
          '</div></div></div></div>';

        // Wait for proper rendering
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate canvas for service certificate
        const serviceCanvas = await safeHtml2Canvas(serviceDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 860,
          height: 1120,
        });

        if (serviceCanvas && serviceCanvas.width > 0 && serviceCanvas.height > 0) {
          const serviceImgData = serviceCanvas.toDataURL("image/png", 1.0);
          
          if (serviceImgData && serviceImgData.startsWith('data:image/png;base64,')) {
            // Add new page for each service with proper scaling
            pdf.addPage("a4", "portrait");
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = serviceCanvas.width * 0.75;
            const imgHeight = serviceCanvas.height * 0.75;
            
            // Scale to fit page while maintaining aspect ratio
            const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            
            // Center the image on the page
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;
            
            pdf.addImage(serviceImgData, "PNG", x, y, scaledWidth, scaledHeight);
          }
        }

        // Clean up
        document.body.removeChild(serviceDiv);
      }

      // Save the complete PDF with all pages
      pdf.save("TFG_John_Doe_Complete_BGV_Report_Package.pdf");

    } catch (error) {
      console.error('Failed to generate sample report:', error);
      alert('Failed to generate sample report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting...</p>
      </div>
    );
  }

  if (!showLanding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="relative">
          <div className="animate-spin h-16 w-16 rounded-full border-4 border-[#0066cc] border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping h-16 w-16 rounded-full border-4 border-[#0066cc] opacity-20"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  const enterpriseFeatures = [
    {
      category: "AI-Powered Intelligence",
      items: [
        { name: "Resume Screening AI", description: "Bulk processing with JD matching" },
        { name: "Fraud Detection ML", description: "98% accuracy in authenticity verification" },
        { name: "Document Analysis", description: "Automated credential validation" },
        { name: "Risk Assessment", description: "Intelligent scoring algorithms" }
      ]
    },
    {
      category: "Verification Services",
      items: [
        { name: "PAN & Aadhaar Verification", description: "Government database validation" },
        { name: "Employment History", description: "Comprehensive background checks" },
        { name: "Court Record Search", description: "Criminal and civil records" },
        { name: "Credit Report Analysis", description: "Financial background verification" }
      ]
    },
    {
      category: "Enterprise Platform",
      items: [
        { name: "Multi-Organization Support", description: "Manage multiple entities" },
        { name: "Role-Based Access Control", description: "Granular permissions system" },
        { name: "Real-Time Dashboards", description: "Live analytics and reporting" },
        { name: "API Integration", description: "Seamless system connectivity" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header - Floating Design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/logos/tfgLogo.jpeg" 
                  alt="TFG Reports Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TFG Reports</h1>
                <p className="text-xs text-gray-500">AI-Powered BGV Platform</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#ai-solutions" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">AI Solutions</a>
              <a href="#bgv-process" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">BGV Process</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#platform" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Platform</a>
              <a href="#reports" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Reports</a>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">AI-Powered BGV Platform</span>
                <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
                  Hire with
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Confidence
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Complete Background Verification (BGV) platform with AI-powered screening and instant report downloads. 
                  <span className="font-semibold text-blue-600"> Verify candidates in minutes, not days.</span>
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">AI</div>
                  <div className="text-sm text-gray-500">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24hrs</div>
                  <div className="text-sm text-gray-500">Report Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">12+</div>
                  <div className="text-sm text-gray-500">BGV Services</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Bank-Grade Security</span>
                </div>
              </div>
            </div>

            {/* Right Content - BGV Report Demo */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  {/* Demo Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">BGV Report Generation</h3>
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Demo</span>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">John Doe</div>
                        <div className="text-sm text-gray-600">Software Engineer</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Candidate ID: BGV2024001</div>
                  </div>

                  {/* Verification Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">BGV Verification Progress</span>
                      <span className="text-blue-600 font-medium">8/12 Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: '67%'}}></div>
                    </div>
                  </div>

                  {/* Verification Results */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Verification Status</h4>
                    {[
                      { name: "PAN Verification", status: "Verified", color: "green" },
                      { name: "Employment History", status: "Verified", color: "green" },
                      { name: "Education Check", status: "In Progress", color: "yellow" },
                      { name: "Court Records", status: "Pending", color: "gray" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            item.color === 'green' ? 'bg-green-500' : 
                            item.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm text-gray-900">{item.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          item.color === 'green' ? 'text-green-600' : 
                          item.color === 'yellow' ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Download Report Button */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">BGV Report Ready</div>
                        <div className="text-xs text-gray-600">Comprehensive verification report</div>
                      </div>
                      <button 
                        onClick={generateSampleReport}
                        disabled={generatingReport}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                          generatingReport 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {generatingReport ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Enhanced AI Showcase - More Prominent */}
      <section id="ai-solutions" className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-8 py-4 rounded-full font-bold text-lg mb-8 shadow-2xl">
              <Sparkles className="w-6 h-6" />
              <span>REVOLUTIONARY AI TECHNOLOGY</span>
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Verification Suite
              </span>
            </h2>
            <p className="text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Experience the future of hiring with cutting-edge artificial intelligence that transforms how you screen, validate, and verify candidates
            </p>
          </div>

          {/* AI Features Grid - Enhanced */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* AI Resume Screening - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:rotate-1">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Rocket className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">AI Resume Screening</h3>
                <p className="text-green-300 font-semibold">Bulk Processing Engine</p>
              </div>
              
              <p className="text-blue-100 mb-8 leading-relaxed text-center">
                Revolutionary AI that processes 100+ resumes simultaneously, ranking candidates by JD compatibility in under 60 seconds
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="text-2xl font-bold text-white">100+</div>
                  <div className="text-xs text-green-200">Resumes</div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="text-2xl font-bold text-white">60s</div>
                  <div className="text-xs text-green-200">Processing</div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-xs text-green-200">Accuracy</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Intelligent JD Matching Algorithm</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Bulk Upload & Batch Processing</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Smart Candidate Ranking System</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Instant Results & Reports</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl p-6 border border-green-400/40">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">100+ Hours</div>
                  <div className="text-green-200 font-semibold">Saved Per Hiring Cycle</div>
                </div>
              </div>
            </div>

            {/* AI CV Validation - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-rotate-1">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">AI CV Validation</h3>
                <p className="text-blue-300 font-semibold">Fraud Detection System</p>
              </div>
              
              <p className="text-blue-100 mb-8 leading-relaxed text-center">
                Advanced machine learning algorithms detect CV fraud, inconsistencies, and authenticity issues with industry-leading accuracy
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-xs text-blue-200">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <div className="text-2xl font-bold text-white">Real-time</div>
                  <div className="text-xs text-blue-200">Detection</div>
                </div>
                <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <div className="text-2xl font-bold text-white">360°</div>
                  <div className="text-xs text-blue-200">Coverage</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Deep Learning Fraud Detection</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Authenticity Scoring Engine</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Pattern Recognition Analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>Risk Assessment Reports</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl p-6 border border-blue-400/40">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">Zero</div>
                  <div className="text-blue-200 font-semibold">False Positives Guaranteed</div>
                </div>
              </div>
            </div>

            {/* AI Education Verification - Enhanced */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:rotate-1">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">AI Education Verification</h3>
                <p className="text-purple-300 font-semibold">Document Analysis Engine</p>
              </div>
              
              <p className="text-blue-100 mb-8 leading-relaxed text-center">
                Automated validation of educational credentials using advanced OCR, document analysis, and institution database verification
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                  <div className="text-2xl font-bold text-white">96%</div>
                  <div className="text-xs text-purple-200">Accuracy</div>
                </div>
                <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                  <div className="text-2xl font-bold text-white">24hrs</div>
                  <div className="text-xs text-purple-200">Turnaround</div>
                </div>
                <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-purple-200">Automated</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Advanced OCR Technology</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Institution Database Validation</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Degree Authenticity Verification</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>Automated Report Generation</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl p-6 border border-purple-400/40">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">98%</div>
                  <div className="text-purple-200 font-semibold">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Technology Highlights */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Powered by Advanced AI Technology</h3>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                Our AI engine combines multiple machine learning models, natural language processing, and computer vision to deliver unmatched accuracy and speed
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Neural Networks</h4>
                <p className="text-blue-200 text-sm">Deep learning models trained on millions of data points</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">NLP Processing</h4>
                <p className="text-blue-200 text-sm">Advanced natural language understanding and analysis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Computer Vision</h4>
                <p className="text-blue-200 text-sm">Document analysis and image recognition technology</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-white mb-2">Big Data Analytics</h4>
                <p className="text-blue-200 text-sm">Real-time processing of massive datasets</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => router.push("/login")}
              className="group px-12 py-6 bg-gradient-to-r from-white to-blue-50 text-blue-900 font-bold rounded-3xl hover:shadow-2xl hover:shadow-white/20 hover:scale-110 transition-all duration-300 inline-flex items-center gap-4 text-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Zap className="w-8 h-8 text-blue-600 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Experience AI-Powered Verification</span>
              <ArrowRight className="w-8 h-8 text-blue-600 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* BGV Application Flow - Step by Step */}
      <section id="bgv-process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-3 rounded-full mb-6">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Simple BGV Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How BGV Verification Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete background verification in 4 simple steps. From candidate onboarding to instant report downloads.
            </p>
          </div>

          {/* Application Flow Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-green-500 z-0 rounded-full"></div>
            
            <div className="grid lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1: Add Candidate */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl relative">
                  <Users className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-sm shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Add Candidate</h3>
                <p className="text-gray-600 mb-4">Upload candidate details, documents, and select required BGV services</p>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-800 font-semibold mb-2">What you need:</div>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Basic candidate information</li>
                    <li>• Identity documents (PAN, Aadhaar)</li>
                    <li>• Employment & education details</li>
                  </ul>
                </div>
              </div>

              {/* Step 2: Select BGV Services */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl relative">
                  <CheckSquare className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-sm shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Select Services</h3>
                <p className="text-gray-600 mb-4">Choose from 12+ BGV services including AI-powered verification options</p>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="text-sm text-indigo-800 font-semibold mb-2">Available services:</div>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    <li>• PAN & Aadhaar verification</li>
                    <li>• Employment & education checks</li>
                    <li>• Court records & credit reports</li>
                  </ul>
                </div>
              </div>

              {/* Step 3: Automated Verification */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl relative">
                  <Cpu className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-sm shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Verification</h3>
                <p className="text-gray-600 mb-4">Our AI engine processes and verifies information across multiple databases</p>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-800 font-semibold mb-2">Processing includes:</div>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Government database checks</li>
                    <li>• AI fraud detection</li>
                    <li>• Cross-reference validation</li>
                  </ul>
                </div>
              </div>

              {/* Step 4: Download Reports */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl relative">
                  <Download className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-sm shadow-lg">
                    4
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Reports</h3>
                <p className="text-gray-600 mb-4">Download comprehensive BGV reports instantly in multiple formats</p>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-800 font-semibold mb-2">Report features:</div>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• PDF & Excel formats</li>
                    <li>• Detailed verification status</li>
                    <li>• Executive summary included</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Typical BGV Timeline</h3>
              <p className="text-gray-600">Most verifications complete within 24-48 hours</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">0-2 hrs</div>
                <div className="text-sm text-gray-700 font-semibold mb-1">Instant Checks</div>
                <div className="text-xs text-gray-600">PAN, Aadhaar, Basic validations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">24 hrs</div>
                <div className="text-sm text-gray-700 font-semibold mb-1">Standard Verification</div>
                <div className="text-xs text-gray-600">Employment, Education, Court records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">48 hrs</div>
                <div className="text-sm text-gray-700 font-semibold mb-1">Complete Report</div>
                <div className="text-xs text-gray-600">All verifications, Final report ready</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => router.push("/login")}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-3 text-lg"
            >
              <span>Start BGV Process</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Enterprise Platform Features */}
      <section id="platform" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg mb-6">
              <Building className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-800 font-semibold">Enterprise Platform</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for Enterprise Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive verification platform designed to handle enterprise-level requirements with advanced features and integrations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{category.category}</h3>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Services - Horizontal Scroll */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-800 font-semibold">Comprehensive BGV Suite</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              12+ Professional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete background verification solutions covering every aspect of candidate screening and validation
            </p>
          </div>

          {/* AI-Powered Services - Featured Row */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Services</h3>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                ✨ NEW AI TECHNOLOGY
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* AI Resume Screening */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">AI Resume Screening</h4>
                      <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">HOT</span>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-4 text-sm">Upload 100+ resumes, get top 10-20 candidates with JD matching in 60 seconds</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Bulk Processing</span>
                    <span className="font-bold">95% Accuracy</span>
                  </div>
                </div>
              </div>

              {/* AI CV Validation */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">AI CV Validation</h4>
                      <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">AI</span>
                    </div>
                  </div>
                  <p className="text-purple-100 mb-4 text-sm">Advanced fraud detection and authenticity verification with 98% accuracy</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Fraud Detection</span>
                    <span className="font-bold">98% Accuracy</span>
                  </div>
                </div>
              </div>

              {/* AI Education Verification */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">AI Education Verification</h4>
                      <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">AI</span>
                    </div>
                  </div>
                  <p className="text-emerald-100 mb-4 text-sm">Automated validation of educational credentials with AI document analysis</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Document OCR</span>
                    <span className="font-bold">24hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Services - Horizontal Scroll */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">🛡️ Core BGV Services</h3>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>← Scroll to explore all services →</span>
                <ChevronDown className="w-4 h-4 rotate-90" />
              </div>
            </div>
            
            {/* Horizontal Scrolling Cards */}
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide">
                {/* PAN Verification */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">PAN Verification</h4>
                      <div className="text-xs text-blue-600 font-semibold">Government Database ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Validate PAN card details and authenticity instantly through government database integration</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Instant</span>
                    <span className="text-green-600 font-bold text-sm">✓ Real-time</span>
                  </div>
                </div>

                {/* Aadhaar Verification */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Aadhaar to UAN</h4>
                      <div className="text-xs text-blue-600 font-semibold">EPFO Integration ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Link and verify Aadhaar with UAN number seamlessly through EPFO database</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">2-4 hrs</span>
                    <span className="text-green-600 font-bold text-sm">✓ Verified</span>
                  </div>
                </div>

                {/* Employment History */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Employment History</h4>
                      <div className="text-xs text-blue-600 font-semibold">Multi-Source ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Comprehensive employment background verification through multiple data sources</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">24-48 hrs</span>
                    <span className="text-green-600 font-bold text-sm">✓ Detailed</span>
                  </div>
                </div>

                {/* Court Records */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Court Records</h4>
                      <div className="text-xs text-blue-600 font-semibold">Legal Database ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Criminal and civil court records verification across multiple jurisdictions</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">48 hrs</span>
                    <span className="text-green-600 font-bold text-sm">✓ Comprehensive</span>
                  </div>
                </div>

                {/* Credit Report */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Credit Report</h4>
                      <div className="text-xs text-blue-600 font-semibold">CIBIL Integration ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Detailed credit history and financial background through CIBIL integration</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Instant</span>
                    <span className="text-green-600 font-bold text-sm">✓ CIBIL</span>
                  </div>
                </div>

                {/* Address Verification */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Address Verification</h4>
                      <div className="text-xs text-blue-600 font-semibold">Field Verification ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Physical address validation and verification through field agents</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-medium">3-5 days</span>
                    <span className="text-green-600 font-bold text-sm">✓ Physical</span>
                  </div>
                </div>

                {/* Education Manual */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Education Check</h4>
                      <div className="text-xs text-blue-600 font-semibold">Institution Direct ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Manual verification of educational credentials directly with institutions</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">5-7 days</span>
                    <span className="text-green-600 font-bold text-sm">✓ Manual</span>
                  </div>
                </div>

                {/* Reference Check */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Reference Check</h4>
                      <div className="text-xs text-blue-600 font-semibold">Direct Contact ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Supervisory and professional reference verification through direct contact</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">2-3 days</span>
                    <span className="text-green-600 font-bold text-sm">✓ Personal</span>
                  </div>
                </div>

                {/* PAN-Aadhaar Seeding */}
                <div className="flex-shrink-0 w-72 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 snap-start">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">PAN-Aadhaar Seeding</h4>
                      <div className="text-xs text-blue-600 font-semibold">Real-time Status ✓</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Verify PAN and Aadhaar linkage status through government databases</p>
                  <div className="flex items-center justify-between">
                    <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">Instant</span>
                    <span className="text-green-600 font-bold text-sm">✓ Live</span>
                  </div>
                </div>
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Ready to Experience Next-Gen BGV?</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                  Join the AI revolution in background verification. Start with our comprehensive suite of services today and hire with complete confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <span>Start BGV Process</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={generateSampleReport}
                    disabled={generatingReport}
                    className={`px-8 py-4 backdrop-blur-sm font-semibold rounded-xl border-2 transition-all duration-300 inline-flex items-center space-x-2 ${
                      generatingReport
                        ? 'bg-gray-500/20 text-gray-300 border-gray-400/30 cursor-not-allowed'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    {generatingReport ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                        <span>Generating Sample Report...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Sample Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="reports" className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <Rocket className="w-5 h-5" />
              <span className="font-semibold">Ready to Transform?</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Start Your AI-Powered
              <br />
              Verification Journey
            </h2>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Experience the future of hiring with TFG Reports - AI-powered background verification that delivers speed, accuracy, and reliability
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/login")}
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300 inline-flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Schedule Demo</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Setup in Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logos/tfgLogo.jpeg" 
                    alt="TFG Reports Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TFG Reports</h3>
                  <p className="text-xs text-gray-400">AI-Powered BGV Platform</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transforming hiring with AI-powered background verification and comprehensive BGV services for modern enterprises.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Users className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Building className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-semibold mb-4 text-blue-300">AI Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Resume Screening AI</li>
                <li className="hover:text-white cursor-pointer transition-colors">CV Fraud Detection</li>
                <li className="hover:text-white cursor-pointer transition-colors">Education Verification</li>
                <li className="hover:text-white cursor-pointer transition-colors">Employment History</li>
                <li className="hover:text-white cursor-pointer transition-colors">Court Record Search</li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold mb-4 text-blue-300">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Enterprise Dashboard</li>
                <li className="hover:text-white cursor-pointer transition-colors">API Integration</li>
                <li className="hover:text-white cursor-pointer transition-colors">Multi-Organization</li>
                <li className="hover:text-white cursor-pointer transition-colors">Role Management</li>
                <li className="hover:text-white cursor-pointer transition-colors">Analytics & Reports</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-blue-300">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Sales</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security & Compliance</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 TFG Reports. All rights reserved. Built with AI for the future of BGV services.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <CheckCircle className="w-3 h-3" />
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}