import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
} from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiFileText,
  FiBarChart2,
  FiRefreshCw,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import { BsGraphUp, BsLightning } from "react-icons/bs";
import {
  setUploadedDocument,
  setAnalyzing,
  generatePrediction,
  clearCurrentPrediction,
  predictCaseOutcomeAsync,
} from "../features/casePredictorSlice";

export function CasePredictor() {
  const dispatch = useDispatch();
  const { currentPrediction, isAnalyzing } = useSelector(
    (state) => state.casePredictor
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        dispatch(
          setUploadedDocument({
            name: file.name,
            size: file.size,
            type: file.type,
          })
        );
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      await dispatch(predictCaseOutcomeAsync({ file: selectedFile })).unwrap();
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Failed to analyze document: " + error);
      dispatch(setAnalyzing(false));
    }
  };

  const handleNewAnalysis = () => {
    dispatch(clearCurrentPrediction());
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getWinColor = (percentage) => {
    if (percentage >= 70) return "#10b981";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={styles.pageWrapper}>
      <Container fluid className="py-4 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="mb-4">
            <Col>
              <div style={styles.header}>
                <div style={styles.headerIcon}>
                  <BsGraphUp size={32} />
                </div>
                <div>
                  <h1 style={styles.title}>AI Case Predictor</h1>
                  <p style={styles.subtitle}>
                    <BsLightning className="me-2" />
                    Upload your case document to get winning probability
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        <AnimatePresence mode="wait">
          {!currentPrediction ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Row className="justify-content-center">
                <Col lg={8} xl={6}>
                  {/* Upload Area */}
                  <Card style={styles.uploadCard}>
                    <Card.Body className="p-5">
                      <div
                        {...getRootProps()}
                        style={{
                          ...styles.dropzone,
                          ...(isDragActive ? styles.dropzoneActive : {}),
                        }}
                      >
                        <input {...getInputProps()} />
                        <motion.div
                          animate={{ y: isDragActive ? -10 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div style={styles.uploadIcon}>
                            <FiUploadCloud size={80} />
                          </div>
                          <h3 style={styles.uploadTitle}>
                            {isDragActive
                              ? "Drop your document here"
                              : "Upload Case Document"}
                          </h3>
                          <p style={styles.uploadText}>
                            Drag and drop your legal document, or click to
                            browse
                          </p>
                          <p style={styles.uploadFormats}>
                            Supported formats: PDF, DOC, DOCX, TXT
                          </p>
                        </motion.div>
                      </div>

                      {selectedFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={styles.filePreview}
                        >
                          <div style={styles.fileInfo}>
                            <FiFileText
                              size={40}
                              style={{ color: "#667eea" }}
                            />
                            <div>
                              <div style={styles.fileName}>
                                {selectedFile.name}
                              </div>
                              <div style={styles.fileSize}>
                                {formatFileSize(selectedFile.size)}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            style={styles.analyzeButton}
                          >
                            {isAnalyzing ? (
                              <>
                                <div
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <FiBarChart2 className="me-2" />
                                Analyze Document
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}

                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={styles.analysisProgress}
                        >
                          <div style={styles.progressHeader}>
                            <FiActivity className="me-2" />
                            AI Analysis in Progress
                          </div>
                          <ProgressBar
                            animated
                            now={100}
                            style={styles.progressBar}
                          />
                          <div style={styles.progressSteps}>
                            {[
                              "Document Parsing",
                              "Legal Analysis",
                              "Case Matching",
                              "Calculating Probability",
                            ].map((step, index) => (
                              <div key={index} style={styles.progressStep}>
                                <FiCheckCircle style={{ color: "#10b981" }} />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Row className="justify-content-center">
                <Col lg={6} xl={5}>
                  {/* Win Percentage Result */}
                  <Card style={styles.resultCard}>
                    <Card.Body className="p-5 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.2,
                        }}
                      >
                        <div style={styles.resultIcon}>🏆</div>
                        <h2 style={styles.resultLabel}>Winning Probability</h2>

                        <div style={styles.percentageContainer}>
                          <svg
                            width="280"
                            height="280"
                            viewBox="0 0 280 280"
                            style={styles.percentageSvg}
                          >
                            {/* Background circle */}
                            <circle
                              cx="140"
                              cy="140"
                              r="120"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="20"
                            />
                            {/* Progress circle */}
                            <motion.circle
                              cx="140"
                              cy="140"
                              r="120"
                              fill="none"
                              stroke="url(#winGradient)"
                              strokeWidth="20"
                              strokeLinecap="round"
                              strokeDasharray={`${
                                currentPrediction.winProbability * 7.54
                              } 754`}
                              transform="rotate(-90 140 140)"
                              initial={{ strokeDasharray: "0 754" }}
                              animate={{
                                strokeDasharray: `${
                                  currentPrediction.winProbability * 7.54
                                } 754`,
                              }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <defs>
                              <linearGradient
                                id="winGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#667eea" />
                                <stop offset="50%" stopColor="#764ba2" />
                                <stop offset="100%" stopColor="#f093fb" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <motion.div
                            style={styles.percentageValue}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <span
                              style={{
                                ...styles.percentageNumber,
                                color: getWinColor(
                                  currentPrediction.winProbability
                                ),
                              }}
                            >
                              {currentPrediction.winProbability}
                            </span>
                            <span style={styles.percentageSymbol}>%</span>
                          </motion.div>
                        </div>

                        <div style={styles.fileNameResult}>
                          📄 {currentPrediction.fileName}
                        </div>

                        <div style={styles.confidenceText}>
                          {currentPrediction.winProbability >= 70
                            ? "✅ High chance of winning"
                            : currentPrediction.winProbability >= 50
                            ? "⚠️ Moderate chance of winning"
                            : "❌ Low chance of winning"}
                        </div>

                        <Button
                          onClick={handleNewAnalysis}
                          style={styles.newAnalysisButton}
                          className="mt-4"
                        >
                          <FiRefreshCw className="me-2" />
                          Analyze Another Document
                        </Button>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    padding: "20px 0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "10px",
  },
  headerIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 15px 35px rgba(102, 126, 234, 0.4)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "white",
    marginBottom: "4px",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "16px",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  uploadCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "30px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
  },
  dropzone: {
    border: "3px dashed rgba(102, 126, 234, 0.5)",
    borderRadius: "24px",
    padding: "80px 40px",
    textAlign: "center",
    background: "rgba(102, 126, 234, 0.05)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  dropzoneActive: {
    borderColor: "#667eea",
    background: "rgba(102, 126, 234, 0.2)",
    transform: "scale(1.02)",
  },
  uploadIcon: {
    color: "#667eea",
    marginBottom: "30px",
  },
  uploadTitle: {
    color: "white",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  uploadText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "18px",
    marginBottom: "12px",
  },
  uploadFormats: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "14px",
  },
  filePreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(102, 126, 234, 0.15)",
    borderRadius: "20px",
    padding: "24px",
    marginTop: "30px",
    border: "1px solid rgba(102, 126, 234, 0.3)",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  fileName: {
    color: "white",
    fontWeight: "600",
    fontSize: "18px",
  },
  fileSize: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "14px",
  },
  analyzeButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "14px",
    padding: "16px 32px",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
  },
  analysisProgress: {
    marginTop: "40px",
    padding: "30px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
  },
  progressHeader: {
    color: "white",
    fontWeight: "600",
    fontSize: "18px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
  },
  progressBar: {
    height: "10px",
    borderRadius: "5px",
    background: "rgba(255, 255, 255, 0.1)",
    marginBottom: "24px",
  },
  progressSteps: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  progressStep: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "15px",
  },
  resultCard: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "30px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
  },
  resultIcon: {
    fontSize: "60px",
    marginBottom: "20px",
  },
  resultLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "30px",
  },
  percentageContainer: {
    position: "relative",
    display: "inline-block",
    marginBottom: "30px",
  },
  percentageSvg: {
    filter: "drop-shadow(0 0 30px rgba(102, 126, 234, 0.5))",
  },
  percentageValue: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "baseline",
  },
  percentageNumber: {
    fontSize: "72px",
    fontWeight: "800",
    lineHeight: 1,
  },
  percentageSymbol: {
    fontSize: "36px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
    marginLeft: "4px",
  },
  fileNameResult: {
    color: "white",
    fontWeight: "600",
    fontSize: "18px",
  },
  confidenceText: {
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginTop: "16px",
  },
  newAnalysisButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "14px",
    padding: "16px 32px",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
  },
};

export default CasePredictor;
