
"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Loader2,
  Download,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Brain,
  RefreshCcw,
  Globe,
} from "lucide-react";

import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import { useOrgState } from "../../context/OrgStateContext";

const SERVICE_ICONS = {
  pan_aadhaar_seeding: "🪪",
  pan_verification: "📄",
  employment_history: "👔",
  aadhaar_to_uan: "🔗",
  credit_report: "💳",
  court_record: "⚖️",
};

const MANUAL_SERVICES = [
  { id: "address_verification", name: "Address Verification" },
  { id: "education_check_manual", name: "Education Manual Check" },
  { id: "employment_history_manual", name: "Employment History Manual" },
  { id: "employment_history_manual_2", name: "Employment History Manual 2" },
  { id: "supervisory_check_1", name: "Supervisory Check 1" },
  { id: "supervisory_check_2", name: "Supervisory Check 2" },
];

const formatServiceName = (raw = "") =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const isAIValidationCheck = (checkName) => {
  return (
    checkName === "ai_cv_validation" || checkName === "ai_education_validation"
  );
};

const getServiceCertId = (stage, checkName, candId) =>
  `cert-${stage}-${checkName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${candId}`;

async function downloadSingleCert(id, fileName, setDownloading, attachments = []) {
  try {
    setDownloading(true);
    const element = document.getElementById(id);
    if (!element) {
      alert("Report not ready.");
      return;
    }

    const canvas = await safeHtml2Canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "pt",
      format: [canvas.width * 0.75, canvas.height * 0.75],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);

    if (attachments && attachments.length > 0) {
      const attachmentLinks = element.querySelectorAll('a[href^="http"]');
      attachmentLinks.forEach((link, idx) => {
        if (idx < attachments.length) {
          const rect = link.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const x = ((rect.left - elementRect.left) * canvas.width * 0.75) / element.offsetWidth;
          const y = ((rect.top - elementRect.top) * canvas.height * 0.75) / element.offsetHeight;
          const width = (rect.width * canvas.width * 0.75) / element.offsetWidth;
          const height = (rect.height * canvas.height * 0.75) / element.offsetHeight;
          pdf.link(x, y, width, height, { url: attachments[idx] });
        }
      });
    }

    pdf.save(fileName);
  } finally {
    setDownloading(false);
  }
}

// A4 pagination helper functions
async function splitContentIntoPages(element, pdf, pdfWidth, pdfHeight) {
  const maxContentHeight = pdfHeight - 120; // Leave space for margins
  let currentPageContent = [];
  let currentHeight = 0;
  let pageNumber = 1;
  
  // Get all child elements
  const children = Array.from(element.children);
  
  // Separate footer from main content
  const footer = element.querySelector('[style*="margin-top: 120px"], [style*="border-top: 2px solid #272626ff"]');
  const mainContent = children.filter(child => child !== footer);
  
  for (let i = 0; i < mainContent.length; i++) {
    const child = mainContent[i];
    
    // Create temporary element to measure height
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '860px';
    tempDiv.appendChild(child.cloneNode(true));
    document.body.appendChild(tempDiv);
    
    const childHeight = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    
    // Check if adding this element would exceed page height
    if (currentHeight + childHeight > maxContentHeight && currentPageContent.length > 0) {
      // Create current page
      await createPage(currentPageContent, pdf, pdfWidth, pdfHeight, pageNumber, false);
      
      // Start new page
      pageNumber++;
      currentPageContent = [child];
      currentHeight = childHeight;
    } else {
      currentPageContent.push(child);
      currentHeight += childHeight;
    }
  }
  
  // Add remaining content and footer to last page
  if (currentPageContent.length > 0 || footer) {
    if (footer) {
      currentPageContent.push(footer);
    }
    await createPage(currentPageContent, pdf, pdfWidth, pdfHeight, pageNumber, true);
  }
}

async function createPage(contentElements, pdf, pdfWidth, pdfHeight, pageNumber, isLastPage) {
  if (pageNumber > 1) {
    pdf.addPage();
  }
  
  // Create page container
  const pageDiv = document.createElement('div');
  pageDiv.style.width = '860px';
  pageDiv.style.minHeight = '1120px';
  pageDiv.style.padding = '40px 50px 60px 50px';
  pageDiv.style.background = '#ffffff';
  pageDiv.style.fontFamily = 'Arial, sans-serif';
  pageDiv.style.color = '#000';
  pageDiv.style.position = 'absolute';
  pageDiv.style.left = '-9999px';
  
  // Add watermark
  const watermark = document.createElement('img');
  watermark.src = '/logos/tfgLogo.jpeg';
  watermark.alt = 'watermark';
  watermark.style.position = 'absolute';
  watermark.style.top = '300px';
  watermark.style.left = '50%';
  watermark.style.transform = 'translateX(-50%)';
  watermark.style.opacity = '0.08';
  watermark.style.width = '750px';
  watermark.style.height = '750px';
  watermark.style.objectFit = 'contain';
  watermark.style.pointerEvents = 'none';
  watermark.style.zIndex = '1';
  pageDiv.appendChild(watermark);
  
  // Add content container
  const contentDiv = document.createElement('div');
  contentDiv.style.position = 'relative';
  contentDiv.style.zIndex = '2';
  
  // Add header only on first page
  if (pageNumber === 1) {
    const header = createReportHeader();
    contentDiv.appendChild(header);
  } else {
    // Add page number for subsequent pages
    const pageHeader = document.createElement('div');
    pageHeader.style.textAlign = 'center';
    pageHeader.style.marginBottom = '30px';
    pageHeader.style.fontSize = '12px';
    pageHeader.style.color = '#666';
    pageHeader.innerHTML = `Page ${pageNumber}`;
    contentDiv.appendChild(pageHeader);
  }
  
  // Add content elements
  contentElements.forEach(element => {
    contentDiv.appendChild(element.cloneNode(true));
  });
  
  pageDiv.appendChild(contentDiv);
  document.body.appendChild(pageDiv);
  
  // Wait for images to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Convert to canvas and add to PDF
  const canvas = await safeHtml2Canvas(pageDiv, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });
  
  const img = canvas.toDataURL("image/png");
  const scaledHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(img, "PNG", 0, 0, pdfWidth, scaledHeight);
  
  // Clean up
  document.body.removeChild(pageDiv);
}

function createReportHeader() {
  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
      <div style="flex-shrink: 0; margin-top: 5px;">
        <img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" />
      </div>
      <div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 55px; flex: 1; padding: 0 20px;">
        <h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 0 0 8px 0; line-height: 1.3;">All Verification Reports</h1>
        <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.4;">Comprehensive Background Verification Summary</p>
      </div>
      <div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 12px; color: #333; line-height: 1.8;">
        <p style="margin: 0 0 5px 0; font-weight: bold;">📞 8886099008</p>
        <p style="margin: 0 0 5px 0;">✉ naresh@tfgorg.com</p>
        <p style="margin: 0 0 5px 0;">🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style="color: #0066cc; text-decoration: underline;">LinkedIn</a></p>
        <p style="margin: 0;">🌐 <a href="https://www.tfgorg.com" target="_blank" style="color: #0066cc; text-decoration: underline;">www.tfgorg.com</a></p>
      </div>
    </div>
  `;
  return header;
}

async function mergeAllCertificates(ids, fileName, setDownloading, candidate, verification, translations) {
  try {
    setDownloading(true);
    let pdf;

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

      return '<tr style="background: ' + (index % 2 === 0 ? "#ffffff" : "#f9f9f9") + ';">' +
        '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + chk.stage + '</td>' +
        '<td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">' + formatServiceName(chk.check) + '</td>' +
        '<td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: ' + statusColor + '; border-bottom: 1px solid #e0e0e0;">' + statusText + '</td>' +
        '</tr>';
    }).join("");

    indexDiv.innerHTML = 
      '<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">' +
      '<img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />' +
      '<div style="position: relative; z-index: 2;">' +
      '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">' +
      '<div style="flex-shrink: 0; margin-top: 5px;"><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" /></div>' +
      '<div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 55px; flex: 1; padding: 0 20px;"><h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 0 0 8px 0; line-height: 1.3;">All Verification Reports</h1><p style="font-size: 14px; color: #555; margin: 0; line-height: 1.4;">' + translations.comprehensiveReport + '</p></div>' +
      '<div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 12px; color: #333; line-height: 1.8;"><p style="margin: 0 0 5px 0; font-weight: bold;">📞 8886099008</p><p style="margin: 0 0 5px 0;">✉ naresh@tfgorg.com</p><p style="margin: 0 0 5px 0;">🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style="color: #0066cc; text-decoration: underline;">LinkedIn</a></p><p style="margin: 0;">🌐 <a href="https://www.tfgorg.com" target="_blank" style="color: #0066cc; text-decoration: underline;">www.tfgorg.com</a></p></div>' +
      '</div>' +
      '<div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 10px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">' + translations.candidateInfo + '</h2>' +
      '<table style="width: 100%; border-collapse: collapse;">' +
      '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold; width: 150px;">' + translations.name + ':</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + candidate.firstName + ' ' + candidate.lastName + '</td></tr>' +
      '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">' + translations.email + ':</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (candidate.email || "N/A") + '</td></tr>' +
      '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">' + translations.phone + ':</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (candidate.phone || "N/A") + '</td></tr>' +
      '<tr><td style="padding: 8px 0; font-size: 13px; color: #333; font-weight: bold;">' + translations.organization + ':</td><td style="padding: 8px 0; font-size: 13px; color: #000;">' + (candidate.organizationName || "N/A") + '</td></tr>' +
      '</table></div>' +
      '<div style="margin-bottom: 30px;"><h2 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">' + translations.verificationSummary + '</h2>' +
      '<table style="width: 100%; border-collapse: collapse; border: 2px solid #e0e0e0;">' +
      '<thead><tr style="background: #f0f0f0;">' +
      '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">' + translations.bgvCheck + '</th>' +
      '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">' + translations.service + '</th>' +
      '<th style="padding: 12px; text-align: left; font-size: 13px; font-weight: bold; color: #000; border-bottom: 2px solid #ddd;">' + translations.status + '</th>' +
      '</tr></thead>' +
      '<tbody>' + tableRows + '</tbody>' +
      '</table></div>' +
      '<div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;"><div style="font-size: 11px; color: #666; margin-bottom: 15px;">' +
      '<p style="margin: 5px 0;">' + translations.generatedOn + ': ' + new Date().toLocaleString() + '</p>' +
      '<p style="margin: 5px 0;">' + translations.totalVerifications + ': ' + allChecks.length + '</p>' +
      '<p style="margin: 5px 0;">' + translations.completed + ': ' + allChecks.filter((c) => c.status === "COMPLETED").length + '</p>' +
      '</div><div style="margin-top: 120px; padding-top: 15px; border-top: 2px solid #272626ff; font-size: 12px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">' +
      '<p style="margin: 0;">' + (translations.language === "ja" 
        ? "TFG AI搭載ITソリューション, T-Hub 4階 Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081"
        : "TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081"
      ) + '</p>' +
      '</div></div></div></div>';

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use simple canvas approach for index page (clean and neat)
    const canvas = await safeHtml2Canvas(indexDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "pt",
      format: [canvas.width * 0.75, canvas.height * 0.75],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
    document.body.removeChild(indexDiv);

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;

      // Use simple canvas approach for each certificate (clean and neat)
      const canvas = await safeHtml2Canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Add new page with proper dimensions for each certificate
      pdf.addPage([canvas.width * 0.75, canvas.height * 0.75]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);

      // Add clickable links for attachments
      const attachmentLinks = el.querySelectorAll('a[href^="http"]');
      attachmentLinks.forEach((link, idx) => {
        const rect = link.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        const x = ((rect.left - elementRect.left) * canvas.width * 0.75) / el.offsetWidth;
        const y = ((rect.top - elementRect.top) * canvas.height * 0.75) / el.offsetHeight;
        const width = (rect.width * canvas.width * 0.75) / el.offsetWidth;
        const height = (rect.height * canvas.height * 0.75) / el.offsetHeight;
        pdf.link(x, y, width, height, { url: link.href });
      });
    }

    pdf.save(fileName);
  } finally {
    setDownloading(false);
  }
}

export default function OrgReportsPage() {
  const { reportsData: candidates, setReportsData: setCandidates } = useOrgState();
  const [orgName, setOrgName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [language, setLanguage] = useState("en"); // Language toggle state

  // Translations
  const translations = {
    en: {
      title: "Organization Reports",
      subtitle: "Comprehensive verification reports & analytics for your organization",
      refreshReports: "Refresh Reports & Verifications",
      downloadReport: "Download Report",
      candidateName: "Candidate Name",
      verificationStatus: "Verification Status",
      completedChecks: "Completed Checks",
      pendingChecks: "Pending Checks",
      totalChecks: "Total Checks",
      noReportsTitle: "No Reports Available",
      fetchingReports: "Fetching Reports",
      aiValidationReports: "🤖 AI-Powered Validation Reports",
      comprehensiveReport: "Comprehensive Background Verification Summary",
      candidateInfo: "Candidate Information",
      verificationSummary: "Verification Summary",
      serviceDetails: "Service Verification Details",
      generatedOn: "Generated on",
      certificateId: "Certificate ID",
      name: "Name",
      email: "Email",
      phone: "Phone",
      organization: "Organization",
      bgvCheck: "BGV Check",
      service: "Service",
      status: "Status",
      totalVerifications: "Total Verifications",
      completed: "Completed",
      verified: "✓ Verified",
      pending: "⏳ Pending",
      inProgress: "🔄 In Progress",
      failed: "❌ Failed",
      notStarted: "⚪ Not Started",
      downloadCompleteReport: "Download Complete Report Package",
      downloadReport: "Download Report",
      downloading: "Downloading...",
      generatingReport: "Generating Report...",
      noVerifications: "No verifications initiated",
      pleaseInitiate: "Please initiate verification process first",
      organization: "Organization",
      totalCandidates: "Total Candidates",
      withIssues: "With Issues",
      services: "services",
      completedStatus: "completed",
      failedStatus: "failed",
      availableOnAIPage: "Available on AI Verification Page",
      pleaseWait: "Please wait while we gather your data...",
      issues: "Issues",
      idLabel: "ID:",
      orgLabel: "Org:",
      // Certificate translations
      verificationReport: "Verification Report",
      candidateName: "Candidate Name",
      candidateId: "Candidate ID",
      verificationId: "Verification ID",
      service: "Service",
      verificationTimestamp: "Verification Timestamp",
      noRemarksAvailable: "No remarks available",
      creditReportDocument: "Credit Report Document",
      viewCreditReport: "View Credit Report (PDF)",
      documentsForVerification: "Documents for Verification",
      documentsSubmittedText: "The following document(s) were submitted for verification based on details provided by the candidate.",
      verificationProof: "Verification Proof",
      verificationCompletedText: "Verification was completed through independent verification. The following proof document(s) were obtained as confirmation.",
      attachmentsText: "Please find the proof of this verification as attachments:",
      document: "Document",
      attachment: "Attachment",
      proof: "Proof",
      // Detailed certificate content translations
      nameLabel: "Name",
      mobileLabel: "Mobile",
      panLabel: "PAN",
      creditScoreLabel: "Credit Score",
      clientIdLabel: "Client ID",
      totalRecordsFound: "Total Records Found",
      matchingRecords: "Matching Records",
      recordLabel: "Record",
      caseLabel: "Case",
      petitionerLabel: "Petitioner",
      respondentLabel: "Respondent",
      courtLabel: "Court",
      filingDateLabel: "Filing Date",
      statusLabel: "Status",
      codeLabel: "Code",
      uanLabel: "UAN",
      employmentHistoryLabel: "Employment History",
      noEmploymentRecords: "No employment records found",
      recordsFound: "records found",
      andMoreRecords: "and",
      moreRecords: "more records",
      moreFields: "more fields",
      noCasesFound: "No cases found for candidate - Verification successful",
      // Empty state messages
      noReportsMessage: "There are no verification reports to display at the moment. Reports will appear here once candidates complete their verification process.",
      reportsAutoRefresh: "Reports will automatically refresh when available",
      // AI validation section
      aiValidationDescription: (
        <>
          Advanced AI validation reports for <strong className="text-purple-600">CV Analysis</strong> and{" "}
          <strong className="text-pink-600">Education Verification</strong> are available on their dedicated pages with enhanced analytics and insights.
        </>
      ),
      cvAnalysis: "CV Analysis",
      educationVerification: "Education Verification"
    },
    ja: {
      title: "組織レポート",
      subtitle: "あなたの組織のための包括的な検証レポートと分析",
      refreshReports: "レポートと検証を更新",
      downloadReport: "レポートをダウンロード",
      candidateName: "候補者名",
      verificationStatus: "検証ステータス",
      completedChecks: "完了したチェック",
      pendingChecks: "保留中のチェック",
      totalChecks: "総チェック数",
      noReportsTitle: "利用可能なレポートがありません",
      fetchingReports: "レポートを取得中",
      aiValidationReports: "🤖 AI搭載検証レポート",
      comprehensiveReport: "包括的な身元調査要約",
      candidateInfo: "候補者情報",
      verificationSummary: "検証要約",
      serviceDetails: "サービス検証詳細",
      generatedOn: "生成日",
      certificateId: "証明書ID",
      name: "名前",
      email: "メール",
      phone: "電話",
      organization: "組織",
      bgvCheck: "BGVチェック",
      service: "サービス",
      status: "ステータス",
      totalVerifications: "総検証数",
      completed: "完了",
      verified: "✓ 検証済み",
      pending: "⏳ 保留中",
      inProgress: "🔄 進行中",
      failed: "❌ 失敗",
      notStarted: "⚪ 未開始",
      downloadCompleteReport: "完全なレポートパッケージをダウンロード",
      downloadReport: "レポートをダウンロード",
      downloading: "ダウンロード中...",
      generatingReport: "レポート生成中...",
      noVerifications: "検証が開始されていません",
      pleaseInitiate: "まず検証プロセスを開始してください",
      organization: "組織",
      totalCandidates: "総候補者数",
      withIssues: "問題あり",
      services: "サービス",
      completedStatus: "完了",
      failedStatus: "失敗",
      availableOnAIPage: "AI検証ページで利用可能",
      pleaseWait: "データを収集中です。しばらくお待ちください...",
      issues: "問題",
      idLabel: "ID:",
      orgLabel: "組織:",
      // Certificate translations
      verificationReport: "検証レポート",
      candidateName: "候補者名",
      candidateId: "候補者ID",
      verificationId: "検証ID",
      service: "サービス",
      verificationTimestamp: "検証タイムスタンプ",
      noRemarksAvailable: "利用可能な備考がありません",
      creditReportDocument: "信用報告書",
      viewCreditReport: "信用報告書を表示（PDF）",
      documentsForVerification: "検証用書類",
      documentsSubmittedText: "候補者が提供した詳細に基づいて、以下の書類が検証のために提出されました。",
      verificationProof: "検証証明",
      verificationCompletedText: "独立した検証により検証が完了しました。確認として以下の証明書類が取得されました。",
      attachmentsText: "この検証の証明を添付ファイルとしてご確認ください：",
      document: "書類",
      attachment: "添付ファイル",
      proof: "証明",
      // Detailed certificate content translations
      nameLabel: "名前",
      mobileLabel: "携帯電話",
      panLabel: "PAN",
      creditScoreLabel: "信用スコア",
      clientIdLabel: "クライアントID",
      totalRecordsFound: "見つかった総記録数",
      matchingRecords: "一致する記録",
      recordLabel: "記録",
      caseLabel: "事件",
      petitionerLabel: "申立人",
      respondentLabel: "被申立人",
      courtLabel: "裁判所",
      filingDateLabel: "提出日",
      statusLabel: "ステータス",
      codeLabel: "コード",
      uanLabel: "UAN",
      employmentHistoryLabel: "雇用履歴",
      noEmploymentRecords: "雇用記録が見つかりません",
      recordsFound: "件の記録が見つかりました",
      andMoreRecords: "さらに",
      moreRecords: "件の記録があります",
      moreFields: "個のフィールドがあります",
      noCasesFound: "候補者の事件は見つかりませんでした - 検証成功",
      // Empty state messages
      noReportsMessage: "現在表示する検証レポートがありません。候補者が検証プロセスを完了すると、ここにレポートが表示されます。",
      reportsAutoRefresh: "レポートは利用可能になると自動的に更新されます",
      // AI validation section
      aiValidationDescription: (
        <>
          <strong className="text-purple-600">CV分析</strong>と{" "}
          <strong className="text-pink-600">教育検証</strong>の高度なAI検証レポートは、強化された分析と洞察を備えた専用ページで利用できます。
        </>
      ),
      cvAnalysis: "CV分析",
      educationVerification: "教育検証",
      noReportsForOrg: "選択された組織の検証レポートがありません。候補者が検証プロセスを完了すると、ここにレポートが表示されます。",
      selectOrgMessage: "検証レポートと分析を表示するには組織を選択してください。"
    }
  };

  const t = { ...translations[language], language }; // Translation helper with language info

  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");
    if (!stored) return;

    try {
      const user = JSON.parse(stored);
      setOrgName(user.organizationName);

      if (user.organizationId) {
        fetchCandidates(user.organizationId);
      }
    } catch (err) {
      console.error("User parse error:", err);
    }
  }, []);

  const fetchCandidates = async (orgId, forceRefresh = false) => {
    if (!forceRefresh && candidates.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/secure/getCandidates?orgId=${orgId}`, { credentials: "include" });
      const data = await res.json();

      const enriched = await Promise.all(
        (data.candidates || []).map(async (c) => {
          try {
            const verRes = await fetch(`/api/proxy/secure/getVerifications?candidateId=${c._id}`, { credentials: "include" });
            const verData = await verRes.json();
            return { ...c, verification: verData.verifications?.[0] || null };
          } catch {
            return { ...c, verification: null };
          }
        })
      );

      setCandidates(enriched);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#ff004f]/10 to-[#ff004f]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#ff004f]/8 to-[#ff004f]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#ff004f]/5 to-[#ff004f]/2 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <FileText size={24} className="text-black" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {t.title}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  {t.subtitle}
                </p>
              </div>
              {/* Refresh Button */}
              <button
                onClick={() => {
                  const stored = localStorage.getItem("bgvUser");
                  if (stored) {
                    try {
                      const user = JSON.parse(stored);
                      if (user.organizationId) {
                        fetchCandidates(user.organizationId, true); // Force refresh
                      }
                    } catch (err) {
                      console.error("User parse error:", err);
                    }
                  }
                }}
                disabled={loading}
                className={`ml-4 p-3 rounded-xl transition-all duration-300 ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ff004f] to-red-500 text-white hover:from-[#e60047] hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105"
                }`}
                title={t.refreshReports}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <RefreshCcw size={20} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 shadow-lg">
                <Globe size={16} className="text-gray-600" />
                <button
                  onClick={() => setLanguage(language === "en" ? "ja" : "en")}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className={`px-2 py-1 rounded ${language === "en" ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
                    EN
                  </span>
                  <span className={`px-2 py-1 rounded ${language === "ja" ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
                    日本語
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/50 shadow-lg">
                <Building2 size={20} className="text-black" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">{t.organization}</p>
                  <p className="font-bold text-slate-800">{orgName}</p>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{candidates.length}</p>
                  <p className="text-xs text-slate-600 font-medium">{t.totalCandidates}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <CheckCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {candidates.filter(c => c.verification?.overallStatus === "COMPLETED").length}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">{t.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <Loader2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {candidates.filter(c => c.verification?.overallStatus === "IN_PROGRESS").length}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">{t.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#ff004f] to-red-500 rounded-lg">
                  <XCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {candidates.filter(c => {
                      const v = c.verification || {};
                      const allChecks = [
                        ...(v.stages?.primary || []),
                        ...(v.stages?.secondary || []),
                        ...(v.stages?.final || [])
                      ];
                      return allChecks.some(chk => chk.status === "FAILED");
                    }).length}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">{t.withIssues}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff004f] via-red-400 to-red-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-[#ff004f] to-red-500 rounded-2xl shadow-lg flex-shrink-0 animate-pulse">
                <Brain size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#ff004f] to-red-600 bg-clip-text text-transparent mb-2">
                  🤖 AI-Powered Validation Reports
                </h3>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  {t.aiValidationDescription}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <span>📄</span>
                    <span>AI-CV-Verification</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <span>🎓</span>
                    <span>AI-Edu-Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#ff004f] rounded-full animate-spin"></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xl font-semibold bg-gradient-to-r from-[#ff004f] to-red-600 bg-clip-text text-transparent">
                {t.fetchingReports}
              </p>
              <p className="text-slate-600 mt-1">{t.pleaseWait}</p>
            </div>
          </div>
        )}

        {!loading && candidates.map((c, index) => {
          const v = c.verification || {};
          const primary = v.stages?.primary || [];
          const secondary = v.stages?.secondary || [];
          const final = v.stages?.final || [];

          const totalChecks = primary.length + secondary.length + final.length;
          const completedChecks = [...primary, ...secondary, ...final].filter(
            (chk) => chk.status === "COMPLETED"
          ).length;
          const failedChecks = [...primary, ...secondary, ...final].filter(
            (chk) => chk.status === "FAILED"
          ).length;

          return (
            <div
              key={c._id}
              className="group relative mb-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff004f]/10 via-[#ff004f]/5 to-[#ff004f]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                <div
                  className="p-3 cursor-pointer bg-gradient-to-r from-transparent via-white/20 to-transparent hover:from-[#ff004f]/5 hover:via-[#ff004f]/3 hover:to-[#ff004f]/5 transition-all duration-300"
                  onClick={() => toggle(c._id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#ff004f] via-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                          {c.firstName?.charAt(0)}
                          {c.lastName?.charAt(0)}
                        </div>
                        {v?.overallStatus === "COMPLETED" && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-800">
                            {c.firstName} {c.lastName}
                          </h3>
                          {failedChecks > 0 && (
                            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-semibold">
                              <XCircle size={12} />
                              {failedChecks} {t.issues}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-medium">{t.idLabel}</span>
                            <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                              {c._id.slice(-8)}
                            </code>
                          </div>
                          
                          {totalChecks > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#ff004f] to-green-500 transition-all duration-500"
                                  style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-slate-600">
                                {completedChecks}/{totalChecks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {v?.overallStatus && (
                        <div className={`px-3 py-1 rounded-xl font-bold text-xs shadow-lg transition-all duration-300 ${
                          v.overallStatus === "COMPLETED"
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                            : v.overallStatus === "IN_PROGRESS"
                            ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                            : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200"
                        }`}>
                          {v.overallStatus === "COMPLETED" && "✅ "}
                          {v.overallStatus === "IN_PROGRESS" && "⏳ "}
                          {v.overallStatus.replace("_", " ")}
                        </div>
                      )}
                      
                      <div className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                        expanded === c._id
                          ? "bg-gradient-to-br from-[#ff004f] to-red-600 text-white shadow-lg"
                          : "bg-white/80 text-slate-600 hover:bg-slate-100"
                      }`}>
                        <div className={`transition-transform duration-300 ${expanded === c._id ? "rotate-180" : ""}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {expanded === c._id && (
                  <div className="border-t border-slate-200/50 bg-gradient-to-b from-transparent to-slate-50/30">
                    <div className="p-4 space-y-6">
                      <div className="absolute -left-[9999px] -top-[9999px]">
                        {primary
                          .filter((chk) => !isAIValidationCheck(chk.check))
                          .map((chk) => (
                            <ServiceCertificate
                              key={getServiceCertId("primary", chk.check, c._id)}
                              id={getServiceCertId("primary", chk.check, c._id)}
                              candidate={c}
                              orgName={orgName}
                              check={chk}
                              stage="primary"
                              t={t}
                            />
                          ))}
                        {secondary
                          .filter((chk) => !isAIValidationCheck(chk.check))
                          .map((chk) => (
                            <ServiceCertificate
                              key={getServiceCertId("secondary", chk.check, c._id)}
                              id={getServiceCertId("secondary", chk.check, c._id)}
                              candidate={c}
                              orgName={orgName}
                              check={chk}
                              stage="secondary"
                              t={t}
                            />
                          ))}
                        {final
                          .filter((chk) => !isAIValidationCheck(chk.check))
                          .map((chk) => (
                            <ServiceCertificate
                              key={getServiceCertId("final", chk.check, c._id)}
                              id={getServiceCertId("final", chk.check, c._id)}
                              candidate={c}
                              orgName={orgName}
                              check={chk}
                              stage="final"
                              t={t}
                            />
                          ))}
                      </div>

                      {primary.length > 0 && (
                        <StageSection
                          title="Primary Services"
                          checks={primary}
                          candidate={c}
                          stage="primary"
                          downloading={downloading}
                          setDownloading={setDownloading}
                          t={t}
                        />
                      )}

                      {secondary.length > 0 && (
                        <StageSection
                          title="Secondary Services"
                          checks={secondary}
                          candidate={c}
                          stage="secondary"
                          downloading={downloading}
                          setDownloading={setDownloading}
                          t={t}
                        />
                      )}

                      {final.length > 0 && (
                        <StageSection
                          title="Final Services"
                          checks={final}
                          candidate={c}
                          stage="final"
                          downloading={downloading}
                          setDownloading={setDownloading}
                          t={t}
                        />
                      )}

                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff004f] via-red-500 to-red-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <button
                          disabled={downloading}
                          onClick={() => {
                            // Check if candidate has any verifications initiated
                            if (totalChecks === 0) {
                              alert(`${t.noVerifications} for ${c.firstName} ${c.lastName} yet. ${t.pleaseInitiate}`);
                              return;
                            }

                            const allIds = [
                              ...primary
                                .filter((chk) => !isAIValidationCheck(chk.check))
                                .map((chk) =>
                                  getServiceCertId("primary", chk.check, c._id)
                                ),
                              ...secondary
                                .filter((chk) => !isAIValidationCheck(chk.check))
                                .map((chk) =>
                                  getServiceCertId("secondary", chk.check, c._id)
                                ),
                              ...final
                                .filter((chk) => !isAIValidationCheck(chk.check))
                                .map((chk) =>
                                  getServiceCertId("final", chk.check, c._id)
                                ),
                            ];

                            mergeAllCertificates(
                              allIds,
                              `${c.firstName}-${c.lastName}-verification-report.pdf`,
                              setDownloading,
                              c,
                              v,
                              t // Pass translations
                            );
                          }}
                          className={`relative w-full bg-gradient-to-r from-[#ff004f] via-red-500 to-red-600 text-white rounded-2xl shadow-lg py-3 px-6 font-semibold text-base flex justify-center items-center gap-3 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                            downloading ? "opacity-50 cursor-not-allowed" : "hover:from-[#e60047] hover:via-red-600 hover:to-red-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {downloading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{t.generatingReport}</span>
                              </>
                            ) : (
                              <>
                                <Download size={18} />
                                <span>{t.downloadCompleteReport}</span>
                              </>
                            )}
                          </div>
                          
                          {!downloading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && candidates.length === 0 && (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-xl">
                <FileText size={48} className="text-slate-400" />
              </div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-[#ff004f]/10 to-[#ff004f]/5 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">
              {t.noReportsTitle}
            </h3>
            <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
              {t.noReportsMessage}
            </p>
            <div className="mt-8 flex justify-center">
              <div className="bg-gradient-to-r from-[#ff004f]/10 to-[#ff004f]/5 px-6 py-3 rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">
                  🔄 {t.reportsAutoRefresh}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
  
  );
}

function ServiceCertificate({ id, candidate, orgName, check, stage, t }) {
  const checks = [{ ...check, stage }];
  return (
    <CertificateBase
      id={id}
      candidate={candidate}
      orgName={orgName}
      checks={checks}
      t={t}
    />
  );
}

function StageSection({ title, checks, candidate, stage, downloading, setDownloading, t }) {
  const [open, setOpen] = useState(false);

  const stageConfig = {
    "Primary Services": {
      num: 1,
      icon: "🚀",
      gradient: "from-red-400 via-pink-500 to-purple-600",
      bgGradient: "from-red-50 via-pink-50 to-purple-50",
      textGradient: "from-red-600 to-purple-700",
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
        <button
          onClick={() => setOpen((p) => !p)}
          className={`w-full flex justify-between items-center bg-gradient-to-r ${config.bgGradient} border-2 border-transparent bg-clip-padding px-6 py-5 rounded-3xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] group`}
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
                  {checks.length} {t.services}
                </span>
                {completedCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✅ {completedCount} {t.completedStatus}
                  </span>
                )}
                {failedCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                    ❌ {failedCount} {t.failedStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className={`p-3 bg-white/50 rounded-2xl transition-all duration-300 ${open ? "rotate-180 bg-white/80" : "group-hover:bg-white/70"}`}>
            <ChevronDown size={20} className="text-slate-700" />
          </div>
        </button>

        {open && (
          <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {checks.map((chk, index) => {
                const done = chk.status === "COMPLETED";
                const failed = chk.status === "FAILED";
                const pending = chk.status === "PENDING";
                const certId = getServiceCertId(stage, chk.check, candidate._id);
                const isAI = isAIValidationCheck(chk.check);

                return (
                  <div
                    key={certId}
                    className={`relative group/card bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                      isAI ? "border-purple-300/50 bg-gradient-to-br from-purple-50/80 to-pink-50/80" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-3 right-3">
                      {done && <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>}
                      {failed && <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>}
                      {pending && <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div>}
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-xl shadow-md ${
                        isAI ? "bg-gradient-to-br from-[#ff004f] to-red-500" : 
                        done ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                        failed ? "bg-gradient-to-br from-red-500 to-pink-500" :
                        "bg-gradient-to-br from-slate-400 to-slate-500"
                      }`}>
                        <span className="text-lg">
                          {isAI ? "🤖" : SERVICE_ICONS[chk.check] || "📝"}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">
                          {formatServiceName(chk.check)}
                        </h4>
                        <p className={`text-xs font-semibold mt-1 ${
                          done ? "text-green-600" :
                          failed ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {done ? t.verified :
                           failed ? t.failed :
                           t.pending}
                        </p>
                      </div>
                    </div>

                    {isAI ? (
                      <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl">
                        <p className="text-xs text-purple-900 font-semibold flex items-center gap-2">
                          <Brain size={14} />
                          <span>{t.availableOnAIPage}</span>
                        </p>
                      </div>
                    ) : (
                      <button
                        disabled={downloading}
                        onClick={() => {
                          // For credit reports, include the credit report link in attachments
                          let attachments = chk.attachments || [];
                          if (chk.check === "credit_report" && chk.remarks?.credit_report_link_permanent) {
                            attachments = [...attachments, chk.remarks.credit_report_link_permanent];
                          }
                          
                          downloadSingleCert(
                            certId,
                            `${candidate._id}-${stage}-${chk.check}.pdf`,
                            setDownloading,
                            attachments
                          );
                        }}
                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                          done
                            ? "bg-gradient-to-r from-[#ff004f] to-red-600 text-white hover:from-[#e60047] hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        } ${downloading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {downloading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{t.downloading}</span>
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            <span>{t.downloadReport}</span>
                          </>
                        )}
                      </button>
                    )}
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

function CertificateBase({ id, candidate, orgName, checks, t }) {
  const verification = candidate.verification;
  const serviceName = formatServiceName(checks[0]?.check || "");
  const language = t.language || "en"; // Get language from translations object

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 500) => {
    if (!text) return text;
    const str = String(text);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  };

  // Prepare remarks with enhanced handling for credit reports and court records
  let bulletItems = [];
  let creditReportLink = null;
  const remarks = checks[0]?.remarks;
  const checkName = checks[0]?.check;

  if (!remarks) {
    bulletItems = [t.noRemarksAvailable];
  } else if (typeof remarks === "string") {
    bulletItems = [truncateText(remarks)];
  } else if (Array.isArray(remarks)) {
    bulletItems = remarks.map((r) => truncateText(String(r)));
  } else if (typeof remarks === "object") {
    // Special handling for credit reports
    if (checkName === "credit_report" && remarks.credit_report_link_permanent) {
      creditReportLink = remarks.credit_report_link_permanent;
      bulletItems.push(`${t.nameLabel}: ${remarks.name || 'N/A'}`);
      bulletItems.push(`${t.mobileLabel}: ${remarks.mobile || 'N/A'}`);
      bulletItems.push(`${t.panLabel}: ${remarks.pan || 'N/A'}`);
      bulletItems.push(`${t.creditScoreLabel}: ${remarks.credit_score || 'N/A'}`);
      bulletItems.push(`${t.clientIdLabel}: ${remarks.client_id || 'N/A'}`);
      // Credit report link will be handled separately in the attachments section
    }
    // Special handling for court records - filter by exact name match
    else if (checkName === "court_record" && remarks.result && Array.isArray(remarks.result)) {
      const firstName = candidate.firstName.toLowerCase().trim();
      const lastName = candidate.lastName.toLowerCase().trim();
      const candidateNameNormal = `${firstName} ${lastName}`;
      const candidateNameReversed = `${lastName} ${firstName}`;
      
      // Filter court records to only show exact matches with candidate name (both orders)
      const matchingRecords = remarks.result.filter(record => {
        const petitioner = (record.petitioner || '').toLowerCase().trim();
        const respondent = (record.respondent || '').toLowerCase().trim();
        
        // Check for exact name match in both normal and reversed order
        return petitioner === candidateNameNormal || respondent === candidateNameNormal ||
               petitioner === candidateNameReversed || respondent === candidateNameReversed;
      });

      bulletItems.push(`${t.nameLabel}: ${remarks.name || 'N/A'}`);
      bulletItems.push(`${t.clientIdLabel}: ${remarks.client_id || 'N/A'}`);
      bulletItems.push(`${t.totalRecordsFound}: ${remarks.result.length}`);
      bulletItems.push(`${t.matchingRecords}: ${matchingRecords.length}`);
      
      if (matchingRecords.length > 0) {
        matchingRecords.slice(0, 3).forEach((record, index) => {
          bulletItems.push(`${t.recordLabel} ${index + 1}:`);
          bulletItems.push(`  ${t.caseLabel}: ${record.case_name || 'N/A'}`);
          bulletItems.push(`  ${t.petitionerLabel}: ${record.petitioner || 'N/A'}`);
          bulletItems.push(`  ${t.respondentLabel}: ${record.respondent || 'N/A'}`);
          bulletItems.push(`  ${t.statusLabel}: ${record.case_status || 'N/A'}`);
          bulletItems.push(`  ${t.courtLabel}: ${record.court_name || 'N/A'}`);
          bulletItems.push(`  ${t.filingDateLabel}: ${record.filing_date || 'N/A'}`);
        });
        
        if (matchingRecords.length > 3) {
          bulletItems.push(`... ${t.andMoreRecords} ${matchingRecords.length - 3} ${t.moreRecords}`);
        }
      } else {
        bulletItems.push(t.noCasesFound);
      }
    }
    // Enhanced handling for employment history and other complex structures
    else if (remarks.message && remarks.message_code) {
      bulletItems.push(`${t.statusLabel}: ${truncateText(remarks.message)}`);
      bulletItems.push(`${t.codeLabel}: ${remarks.message_code}`);
      
      if (remarks.data) {
        bulletItems.push(`${t.clientIdLabel}: ${remarks.data.client_id || 'N/A'}`);
        
        if (remarks.data.uan) {
          bulletItems.push(`${t.uanLabel}: ${remarks.data.uan}`);
        }
        
        if (remarks.data.employment_history) {
          if (Array.isArray(remarks.data.employment_history) && remarks.data.employment_history.length === 0) {
            bulletItems.push(`${t.employmentHistoryLabel}: ${t.noEmploymentRecords}`);
          } else if (Array.isArray(remarks.data.employment_history)) {
            bulletItems.push(`${t.employmentHistoryLabel}: ${remarks.data.employment_history.length} ${t.recordsFound}`);
            // Limit employment history records to prevent overflow
            const maxRecords = 3;
            remarks.data.employment_history.slice(0, maxRecords).forEach((emp, index) => {
              bulletItems.push(`  ${t.recordLabel} ${index + 1}: ${truncateText(JSON.stringify(emp), 200)}`);
            });
            if (remarks.data.employment_history.length > maxRecords) {
              bulletItems.push(`  ... ${t.andMoreRecords} ${remarks.data.employment_history.length - maxRecords} ${t.moreRecords}`);
            }
          }
        }
        
        // Handle other data fields with truncation
        Object.entries(remarks.data).forEach(([key, value]) => {
          if (key !== 'client_id' && key !== 'uan' && key !== 'employment_history') {
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
            bulletItems.push(`${key}: ${truncateText(valueStr, 300)}`);
          }
        });
      }
      
      if (remarks.status_code) {
        bulletItems.push(`Status Code: ${remarks.status_code}`);
      }
      
      if (remarks.success !== undefined) {
        bulletItems.push(`Success: ${remarks.success ? 'Yes' : 'No'}`);
      }
    } else {
      // Handle other object types with truncation
      const entries = Object.entries(remarks);
      const maxEntries = 10; // Limit number of entries to prevent overflow
      
      entries.slice(0, maxEntries).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          bulletItems.push(`${k}: ${truncateText(JSON.stringify(v), 300)}`);
        } else {
          bulletItems.push(`${k}: ${truncateText(String(v), 300)}`);
        }
      });
      
      if (entries.length > maxEntries) {
        bulletItems.push(`... ${t.andMoreRecords} ${entries.length - maxEntries} ${t.moreFields}`);
      }
    }
  } else {
    bulletItems = [truncateText(String(remarks))];
  }

  const attachments = checks[0]?.attachments || [];
  const hasAttachments = attachments && attachments.length > 0;
  
  // Get proof files for manual verifications
  const proofFiles = checks[0]?.proofFiles || [];
  const hasProofFiles = proofFiles && proofFiles.length > 0;
  
  // Filter out proof file URLs from attachments to get only candidate documents
  const proofFileUrls = proofFiles.map(pf => pf.s3_url);
  const candidateDocuments = attachments.filter(url => !proofFileUrls.includes(url));
  const hasCandidateDocuments = candidateDocuments && candidateDocuments.length > 0;
  
  // Check if this is a manual verification (check against MANUAL_SERVICES or has proofFiles)
  const isManualService = MANUAL_SERVICES.some(service => service.id === checkName);
  const isManualVerification = isManualService || hasProofFiles;
  
  // Define which checks should show candidate documents (only employment and education checks)
  const checksWithCandidateDocuments = [
    'employment_history_manual',
    'employment_history_manual_2', 
    'education_check_manual'
  ];
  const shouldShowCandidateDocuments = checksWithCandidateDocuments.includes(checkName) && hasCandidateDocuments;

  return (
    <div
      id={id}
      style={{
        width: "860px",
        minHeight: "1120px",
        padding: "10px 50px 60px 50px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src="/logos/tfgLogo.jpeg"
        alt="watermark"
        style={{
          position: "absolute",
          top: "300px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.08,
          width: "750px",
          height: "750px",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, marginTop: "10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "35px",
            marginBottom: "25px",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: "5px" }}>
            <img
              src="/logos/tfgLogo.jpeg"
              alt="logo"
              style={{
                maxHeight: "180px",
                maxWidth: "450px",
                height: "auto",
                width: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              marginTop: "55px",
            }}
          >
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: 0,
                lineHeight: "1",
                fontFamily: "Arial Black, Arial, sans-serif",
              }}
            >
              {serviceName}
            </h1>

            <h2
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: "0",
                lineHeight: "1",
                fontFamily: "Arial Black, Arial, sans-serif",
              }}
            >
              {t.verificationReport}
            </h2>
          </div>
        </div>

        <div
          style={{
            fontSize: "15px",
            lineHeight: "28px",
            marginTop: "-20px",
            marginBottom: "50px",
          }}
        >
          <p>
            <strong>{t.candidateName}:</strong> {candidate.firstName}{" "}
            {candidate.lastName}
          </p>
          <p>
            <strong>{t.candidateId}:</strong> {candidate._id}
          </p>
          <p>
            <strong>{t.verificationId}:</strong> {verification?._id || "—"}
          </p>
          <p>
            <strong>{t.organization}:</strong> {orgName}
          </p>
          <p>
            <strong>{t.service}:</strong> {serviceName}
          </p>
          <p>
            <strong>{t.verificationTimestamp}:</strong>{" "}
            {new Date().toLocaleString()}
          </p>

          <p style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <strong>{t.status}:</strong>
            <span
              style={{ 
                color: checks[0]?.status === "COMPLETED" ? "#5cb85c" : 
                       checks[0]?.status === "FAILED" ? "#dc2626" : "#f59e0b", 
                fontWeight: "bold", 
                fontSize: "16px" 
              }}
            >
              {checks[0]?.status === "COMPLETED" ? t.verified :
               checks[0]?.status === "FAILED" ? t.failed :
               checks[0]?.status === "PENDING" ? t.pending :
               t.inProgress}
            </span>
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: "3px",
            background: "#272626ff",
            marginTop: "10px",
            marginBottom: "60px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "32px",
              background: checks[0]?.status === "COMPLETED" ? "#5cb85c" : 
                         checks[0]?.status === "FAILED" ? "#dc2626" : "#f59e0b",
              borderRadius: "5px",
            }}
          />
          <div
            style={{
              width: "25%",
              height: "2px",
              background: checks[0]?.status === "COMPLETED" ? "#5cb85c" : 
                         checks[0]?.status === "FAILED" ? "#dc2626" : "#f59e0b",
              marginLeft: "10px",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          {bulletItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  marginRight: "10px",
                  color: "#000",
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: "14px", color: "#000" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Credit Report Link Section */}
        {creditReportLink && (
          <div style={{ marginBottom: "30px" }}>
            <p style={{ fontSize: "14px", color: "#000", fontWeight: "bold", marginBottom: "15px" }}>
              {t.creditReportDocument}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                fontSize: "13px",
              }}
            >
              <span style={{ marginRight: "8px" }}>💳</span>
              <a 
                href={creditReportLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#0066cc", 
                  textDecoration: "underline",
                  wordBreak: "break-all",
                  cursor: "pointer"
                }}
              >
                {t.viewCreditReport}
              </a>
            </div>
          </div>
        )}

        {/* Manual Verification Sections */}
        {isManualVerification && (
          <>
            {/* Documents for Verification Section - Only show for employment/education checks with candidate documents */}
            {shouldShowCandidateDocuments && (
              <div style={{ marginBottom: "30px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#000",
                    fontWeight: "bold",
                    marginBottom: "15px",
                  }}
                >
                  {t.documentsForVerification}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginBottom: "15px",
                  }}
                >
                  {t.documentsSubmittedText}
                </p>
                {candidateDocuments.map((url, idx) => {
                  const fileName = url.split("/").pop() || `${t.document} ${idx + 1}`;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>📄</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#0066cc",
                          textDecoration: "underline",
                          wordBreak: "break-all",
                          cursor: "pointer",
                        }}
                      >
                        {fileName}
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Verification Proof Section */}
            <div style={{ marginBottom: "30px" }}>
              <p
                style={{
                  fontSize: "14px",
                  color: "#000",
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                {t.verificationProof}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "15px",
                }}
              >
                {t.verificationCompletedText}
              </p>
              {proofFiles.map((proofFile, idx) => {
                const fileName = proofFile.filename || `${t.proof} ${idx + 1}`;
                const fileUrl = proofFile.s3_url;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>✅</span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#0066cc",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        cursor: "pointer",
                      }}
                    >
                      {fileName}
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Attachments Section (for non-manual verifications) */}
        {!isManualVerification && hasAttachments && (
          <div style={{ marginBottom: "30px" }}>
            <p
              style={{
                fontSize: "14px",
                color: "#000",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              {t.attachmentsText}
            </p>
            {attachments.map((url, idx) => {
              const fileName = url.split("/").pop() || `${t.attachment} ${idx + 1}`;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>📎</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0066cc",
                      textDecoration: "underline",
                      wordBreak: "break-all",
                      cursor: "pointer",
                    }}
                  >
                    {fileName}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

     <div
  style={{
    position: "absolute",
    bottom: "40px",       // ✅ footer sits near page bottom
    left: "50px",
    right: "50px",
    paddingTop: "12px",
    borderTop: "2px solid #272626ff",
    fontSize: "12px",
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: "1.4",
  }}
>

        <p style={{ margin: 0 }}>
          {language === "ja" 
            ? "TFG AI搭載ITソリューション, T-Hub 4階 Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081"
            : "TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081"
          }
        </p>
      </div>
    </div>
  );
}
