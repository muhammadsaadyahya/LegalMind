import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFileText,
  FiTarget,
  FiBook,
  FiCheckCircle,
} from "react-icons/fi";
import { mockRAGResults, mockSummaries } from "../mockData";
import { fetchDocuments } from "../features/documentsSlice";
import axios from "axios";

export function RAGSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const dispatch = useDispatch();
  const documents = useSelector((state) => state.documents.items);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const toggleDocumentSelection = (docId) => {
    setSelectedDocument((prev) => (prev === docId ? null : docId));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert("Please enter a question");
      return;
    }

    if (!selectedDocument) {
      alert("Please select a document");
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/ai/rag/" + selectedDocument,
        {
          question: query,
          documentId: selectedDocument,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Full backend response:", response.data);

      // Backend returns { answer, contexts: [{ chunk, score }, ...] }
      const answer = response.data.answer || "No answer found";
      let contexts = response.data.contexts || [];

      // Ensure contexts is an array
      if (!Array.isArray(contexts)) {
        console.log("Contexts is not an array, converting to empty array");
        contexts = [];
      }

      console.log("Contexts array:", contexts);
      console.log("Contexts length:", contexts.length);
      console.log("Is array?", Array.isArray(contexts));

      // Create separate result for each context
      const contextResults = contexts.map((contextObj, index) => {
        console.log(`Context ${index}:`, contextObj);
        return {
          id: Date.now() + index,
          query: query,
          answer: answer,
          snippet: (contextObj.chunk || contextObj).substring(0, 150) + "...",
          source: `Context ${index + 1}`,
          context: contextObj.chunk || contextObj,
          relevance: contextObj.score || 0.85,
        };
      });

      setResults(
        contextResults.length > 0
          ? contextResults
          : [
              {
                id: Date.now(),
                query: query,
                answer: answer,
                snippet: answer.substring(0, 150) + "...",
                source: "Generated Answer",
                relevance: 0.85,
              },
            ]
      );
      setSelectedResult(null);
    } catch (error) {
      console.error("RAG search failed:", error);
      alert(
        "Failed to search: " + (error.response?.data?.message || error.message)
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>RAG Legal Research</h1>
      <p style={styles.subtitle}>
        Ask questions about your case documents and get AI-powered answers
      </p>

      <div style={styles.content}>
        {/* Search Panel */}
        <div style={styles.searchPanel}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              style={styles.searchInput}
            />
            <button
              type="submit"
              style={styles.searchButton}
              disabled={isSearching}
            >
              {isSearching ? "🔍 Searching..." : "🔍 Search"}
            </button>
          </form>

          {/* Document Selection */}
          <div style={styles.summariesSection}>
            <h3 style={styles.summariesTitle}>Select Document</h3>
            <p style={styles.selectInfo}>
              Choose one document to search{" "}
              {selectedDocument ? "(1 selected)" : ""}
            </p>
            {documents.length > 0 ? (
              documents.map((doc) => {
                const docId = doc._id || doc.id;
                const isSelected = selectedDocument === docId;
                return (
                  <div
                    key={docId}
                    onClick={() => toggleDocumentSelection(docId)}
                    style={{
                      ...styles.summaryCard,
                      ...(isSelected && styles.summaryCardSelected),
                      cursor: "pointer",
                    }}
                  >
                    <div style={styles.documentHeader}>
                      <div style={styles.checkboxContainer}>
                        {isSelected && (
                          <FiCheckCircle style={styles.checkIcon} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={styles.summaryTitle}>
                          {doc.fileName || doc.name}
                        </h4>
                        <p style={styles.documentMeta}>
                          {(doc.fileSize / 1024).toFixed(2)}KB •{" "}
                          {new Date(
                            doc.createdAt || doc.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={styles.noDocuments}>No documents available</p>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div style={styles.resultsPanel}>
          {results.length > 0 ? (
            <div>
              <h2 style={styles.resultsTitle}>Contexts ({results.length})</h2>
              <p style={styles.contextInfo}>
                Click on any context to see the full answer generated from all
                contexts
              </p>
              <div style={styles.resultsList}>
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    style={{
                      ...styles.resultItem,
                      ...(selectedResult?.id === result.id &&
                        styles.resultItemActive),
                    }}
                  >
                    <div style={styles.resultQuery}>Context {index + 1}</div>
                    <div style={styles.resultSnippet}>
                      {result.context || result.snippet}
                    </div>
                    <div style={styles.resultMeta}>
                      <span style={styles.resultSource}>
                        📄 {result.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Result Details */}
              {selectedResult && (
                <div style={styles.detailsCard}>
                  <h3 style={styles.detailsTitle}>
                    Generated Answer (from all contexts)
                  </h3>
                  <p style={styles.detailsText}>{selectedResult.answer}</p>
                  <div style={styles.detailsMeta}>
                    <span>✨ Generated using all retrieved contexts</span>
                    <span>
                      🎯 Relevance: {Math.round(selectedResult.relevance * 100)}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.noResults}>
              <p style={styles.noResultsIcon}>📚</p>
              <p style={styles.noResultsText}>
                {query
                  ? "No results found. Try a different query."
                  : "Enter a question to search your documents"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "100%",
    margin: "0 auto",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "rgba(255, 255, 255, 0.6)",
    margin: "0 0 24px 0",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "24px",
    height: "calc(100vh - 180px)",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  searchPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  searchForm: {
    display: "flex",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  searchInput: {
    flex: 1,
    padding: "14px 16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
  },
  searchButton: {
    padding: "14px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.2s ease",
  },
  summariesSection: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  summariesTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 8px 0",
  },
  selectInfo: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
    margin: "0 0 16px 0",
  },
  summaryCard: {
    padding: "14px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    transition: "all 0.2s ease",
  },
  summaryCardSelected: {
    background: "rgba(102, 126, 234, 0.2)",
    border: "1px solid rgba(102, 126, 234, 0.4)",
    borderLeft: "4px solid #667eea",
  },
  documentHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  checkboxContainer: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkIcon: {
    color: "#667eea",
    fontSize: "18px",
  },
  summaryTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 4px 0",
    wordBreak: "break-word",
  },
  documentMeta: {
    fontSize: "11px",
    color: "rgba(255, 255, 255, 0.5)",
    margin: "0",
  },
  noDocuments: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    padding: "20px",
    margin: "0",
  },
  summaryText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    margin: "0",
    lineHeight: "1.6",
  },
  resultsPanel: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "28px",
    height: "100%",
    overflowY: "auto",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  resultsTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 8px 0",
  },
  contextInfo: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
    margin: "0 0 20px 0",
    fontStyle: "italic",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  resultItem: {
    padding: "16px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  resultItemActive: {
    background: "rgba(102, 126, 234, 0.15)",
    borderColor: "rgba(102, 126, 234, 0.4)",
    borderLeft: "4px solid #667eea",
  },
  resultQuery: {
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
    marginBottom: "8px",
  },
  resultSnippet: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: "10px",
    lineHeight: "1.6",
    fontStyle: "italic",
  },
  resultMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
  },
  resultSource: {},
  resultRelevance: {
    fontWeight: "700",
    color: "#a5b4fc",
  },
  detailsCard: {
    padding: "20px",
    background: "rgba(102, 126, 234, 0.15)",
    borderRadius: "12px",
    borderLeft: "4px solid #667eea",
    border: "1px solid rgba(102, 126, 234, 0.3)",
  },
  detailsTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#a5b4fc",
    margin: "0 0 12px 0",
  },
  detailsText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.7",
    margin: "0 0 16px 0",
  },
  detailsMeta: {
    display: "flex",
    gap: "20px",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
  },
  noResults: {
    textAlign: "center",
    padding: "80px 20px",
    color: "rgba(255, 255, 255, 0.5)",
  },
  noResultsIcon: {
    fontSize: "56px",
    margin: "0 0 16px 0",
  },
  noResultsText: {
    margin: "0",
    fontSize: "15px",
  },
};
