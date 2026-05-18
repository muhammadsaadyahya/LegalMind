import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { FiFile, FiDownload, FiEye, FiFilter } from "react-icons/fi";
import {
  fetchDocuments,
  deleteDocument,
  generateSummary,
} from "../features/documentsSlice";

export function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState("all");
  const documents = useSelector((state) => state.documents.items);
  const summaries = useSelector((state) => state.documents.summary);
  const loadingSummary = useSelector((state) => state.documents.loadingSummary);
  const cases = useSelector((state) => state.cases.items);
  const currentUser = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  // Get summary for selected document
  const summary = selectedDoc ? summaries[selectedDoc._id] || "" : "";
  const isGenerating = loadingSummary;
  useEffect(() => {
    console.log("Dispatched");
    dispatch(fetchDocuments());
    console.log(documents);
  }, []);
  // Generate AI Summary
  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;
    try {
      await dispatch(generateSummary(selectedDoc._id)).unwrap();
    } catch (error) {
      alert("Failed to generate summary: " + error);
    }
  };

  const handleDownload = async (docId) => {
    const token = localStorage.getItem("token");

    window.open(`/api/documents/download/${docId}?token=${token}`, "_blank");
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;

    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await dispatch(deleteDocument(selectedDoc._id)).unwrap();
      setSelectedDoc(null);
      alert("Document deleted successfully!");
    } catch (error) {
      alert("Failed to delete document: " + error);
    }
  };

  // Download Summary as PDF file
  const handleDownloadSummary = () => {
    if (!summary) {
      alert("Please generate a summary first!");
      return;
    }

    if (!selectedDoc) {
      alert("No document selected!");
      return;
    }

    // Get file extension
    const fileExtension = selectedDoc.fileName
      ? selectedDoc.fileName
          .substring(selectedDoc.fileName.lastIndexOf(".") + 1)
          .toUpperCase()
      : "PDF";
    const fileSize = (selectedDoc.fileSize / 1024).toFixed(2) + " KB";

    // Create PDF content using HTML and print to PDF
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Summary - ${
            selectedDoc.fileName || "Document"
          }</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              line-height: 1.8;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #667eea;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .header .subtitle {
              color: #666;
              font-size: 14px;
            }
            .meta-info {
              background: #f8f9fa;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 25px;
              border-left: 4px solid #667eea;
            }
            .meta-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .meta-info strong {
              color: #667eea;
            }
            .content {
              white-space: pre-wrap;
              font-size: 15px;
              background: #fff;
              padding: 20px;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚖️ LegalMind</h1>
            <div class="subtitle">AI-Generated Document Summary</div>
          </div>
          
          <div class="meta-info">
            <p><strong>Document:</strong> ${
              selectedDoc.fileName || "Document"
            }</p>
            <p><strong>Type:</strong> ${fileExtension} | <strong>Size:</strong> ${fileSize}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="content">${summary}</div>
          
          <div class="footer">
            <p>Generated by LegalMind AI Assistant</p>
            <p>© ${new Date().getFullYear()} LegalMind - All Rights Reserved</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  let filteredDocs = documents;
  // if (currentUser?.role === "lawyer") {
  //   const myCaseIds = cases
  //     .filter((c) => c.lawyerId === currentUser.id)
  //     .map((c) => c.id);
  //   filteredDocs = documents.filter((d) => myCaseIds.includes(d.caseId));
  // } else if (currentUser?.role === "client") {
  //   const myCaseIds = cases
  //     .filter((c) => c.clientId === currentUser.id)
  //     .map((c) => c.id);
  //   filteredDocs = documents.filter((d) => myCaseIds.includes(d.caseId));
  // }

  if (filter !== "all") {
    filteredDocs = filteredDocs.filter(
      (d) =>
        d.fileName.substring(d.fileName.lastIndexOf(".") + 1).toUpperCase() ===
        filter.toUpperCase()
    );
  }

  const caseTitle = (caseId) =>
    cases.find((c) => c.id === caseId)?.title ?? "Unknown";

  const types = ["all", "pdf", "docx", "txt", "doc"];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Documents</h1>

        <div style={styles.content}>
          {/* Documents List */}
          <div style={styles.listPanel}>
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Filter by Type</label>
              <div style={styles.filterButtons}>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    style={{
                      ...styles.filterButton,
                      ...(filter === type && styles.filterButtonActive),
                    }}
                  >
                    {type === "all" ? "All" : type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.listHeader}>
              <h2 style={styles.listTitle}>
                Documents ({filteredDocs.length})
              </h2>
            </div>

            <div style={styles.documentsList}>
              {filteredDocs.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => {
                    setSelectedDoc(doc);
                  }}
                  style={{
                    ...styles.documentItem,
                    ...(selectedDoc?.id === doc._id &&
                      styles.documentItemActive),
                  }}
                >
                  <div style={styles.documentIcon}>
                    {doc.type === "txt"
                      ? "📄"
                      : doc.type === "docx"
                      ? "📝"
                      : "📄"}
                  </div>
                  <div style={styles.documentInfo}>
                    <div style={styles.documentName}>{doc.fileName}</div>
                    <div style={styles.documentMeta}>
                      {(doc.fileSize / 1024).toFixed(2)}KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Details */}
          <div style={styles.detailsPanel}>
            {selectedDoc ? (
              <div>
                <div style={styles.documentPreview}>
                  <div style={styles.previewIcon}>
                    {selectedDoc.type === "txt"
                      ? "📄"
                      : selectedDoc.type === "docx"
                      ? "📝"
                      : "📄"}
                  </div>
                  <div style={styles.previewFileName}>
                    {selectedDoc.fileName}
                  </div>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <label style={styles.detailLabel}>File Type</label>
                    <div style={styles.detailValue}>{"pdf".toUpperCase()}</div>
                  </div>
                  <div style={styles.detailItem}>
                    <label style={styles.detailLabel}>File Size</label>
                    <div style={styles.detailValue}>
                      {(selectedDoc.fileSize / 1024).toFixed(2)}KB
                    </div>
                  </div>
                  <div style={styles.detailItem}>
                    <label style={styles.detailLabel}>Uploaded By</label>
                    <div style={styles.detailValue}>
                      {selectedDoc.uploadedBy}
                    </div>
                  </div>
                  <div style={styles.detailItem}>
                    <label style={styles.detailLabel}>Upload Date</label>
                    <div style={styles.detailValue}>
                      {new Date(selectedDoc.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short", // "Dec"
                          day: "2-digit", // "01"
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.caseSection}>
                  <label style={styles.detailLabel}>Associated Case</label>
                  <div style={styles.caseLink}>
                    {caseTitle(selectedDoc.caseId)}
                  </div>
                </div>

                <div style={styles.actionsSection}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleDownload(selectedDoc._id)}
                  >
                    📥 Download
                  </button>
                  <button
                    style={{ ...styles.actionButton, background: "#ef4444" }}
                    onClick={handleDelete}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* Summary Section */}
                <div style={styles.summarySection}>
                  <div style={styles.summaryHeader}>
                    <label style={styles.detailLabel}>
                      AI Document Summary
                    </label>
                    <div style={styles.summaryButtons}>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        style={{
                          ...styles.summaryButton,
                          opacity: isGenerating ? 0.7 : 1,
                        }}
                      >
                        {isGenerating
                          ? "⏳ Generating..."
                          : "✨ Generate Summary"}
                      </button>
                      <button
                        onClick={handleDownloadSummary}
                        style={{
                          ...styles.summaryButton,
                          ...styles.downloadSummaryButton,
                        }}
                      >
                        📄 Download as PDF
                      </button>
                    </div>
                  </div>
                  {summary && (
                    <div style={styles.summaryContent}>
                      <pre style={styles.summaryText}>{summary}</pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.noSelection}>
                <div style={styles.noSelectionIcon}>📁</div>
                <h3 style={styles.noSelectionTitle}>Select a Document</h3>
                <p style={styles.noSelectionText}>
                  Choose a document from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    paddingTop: "20px",
    paddingBottom: "40px",
  },
  container: {
    padding: "0 24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 24px 0",
    display: "flex",
    alignItems: "center",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "24px",
  },
  listPanel: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  filterSection: {
    padding: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(102, 126, 234, 0.1)",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#a5b4fc",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "8px",
  },
  filterButtons: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "8px 14px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  filterButtonActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    border: "none",
  },
  listHeader: {
    padding: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(102, 126, 234, 0.1)",
  },
  listTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    margin: "0",
  },
  documentsList: {
    overflowY: "auto",
    maxHeight: "600px",
  },
  documentItem: {
    display: "flex",
    gap: "12px",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  documentItemActive: {
    background: "rgba(102, 126, 234, 0.2)",
    borderLeft: "4px solid #667eea",
  },
  documentIcon: {
    fontSize: "28px",
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
  },
  documentMeta: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: "4px",
  },
  detailsPanel: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "28px",
    maxHeight: "calc(100vh - 150px)",
    overflowY: "auto",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  noSelection: {
    textAlign: "center",
    padding: "80px 20px",
  },
  noSelectionIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  noSelectionTitle: {
    color: "white",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  noSelectionText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "14px",
  },
  documentPreview: {
    textAlign: "center",
    padding: "40px 20px",
    background: "rgba(102, 126, 234, 0.1)",
    borderRadius: "16px",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  previewIcon: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  previewFileName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "24px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  detailLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailValue: {
    fontSize: "15px",
    color: "white",
    fontWeight: "600",
  },
  caseSection: {
    marginBottom: "24px",
  },
  caseLink: {
    fontSize: "14px",
    background: "rgba(102, 126, 234, 0.2)",
    color: "#a5b4fc",
    fontWeight: "600",
    marginTop: "8px",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid rgba(102, 126, 234, 0.3)",
    transition: "all 0.2s ease",
  },
  notesSection: {
    marginBottom: "24px",
  },
  notesText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: "8px",
    padding: "14px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
    lineHeight: "1.7",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  actionsSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  actionButton: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.2s ease",
  },
  summarySection: {
    marginTop: "24px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  summaryButtons: {
    display: "flex",
    gap: "10px",
  },
  summaryButton: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
    transition: "all 0.2s ease",
  },
  downloadSummaryButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
  },
  summaryContent: {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  summaryText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    margin: 0,
  },
};
