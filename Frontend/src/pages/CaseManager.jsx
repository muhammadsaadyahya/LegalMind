import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiTag,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiUpload,
} from "react-icons/fi";
import {
  addCase,
  addCaseItem,
  fetchCases,
  fetchlawyers,
} from "../features/casesSlice";
import { addDocumentAsync } from "../features/documentsSlice";
import { mockUsers } from "../mockData";

const statusColors = {
  "In Progress": {
    bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#60a5fa",
  },
  Discovery: {
    bg: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
    color: "#facc15",
  },
  Closed: {
    bg: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#22c55e",
  },
  "On Hold": {
    bg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    color: "#f97316",
  },
};

export function CaseManager() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showLawyerSelectModal, setShowLawyerSelectModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [newCase, setNewCase] = useState({
    title: "",
    caseType: "Civil",
    description: "",
    tags: "",
    lawyerUsername: "",
  });
  const [newDocument, setNewDocument] = useState(null);

  const dispatch = useDispatch();
  const cases = useSelector((state) => state.cases.items);
  const currentUser = useSelector((state) => state.auth.user);

  const lawyers = useSelector((state) => state.cases.lawyers);

  useEffect(() => {
    dispatch(fetchCases());
    dispatch(fetchlawyers());
  }, []);

  const handleAddCase = () => {
    if (!newCase.title.trim()) {
      // alert("Please enter a case title");
      return;
    }
    if (!selectedLawyer) {
      // alert("Please select a lawyer for this case");
      return;
    }

    const caseToAdd = {
      title: newCase.title,
      caseType: newCase.caseType,
      description: newCase.description,
      client: currentUser?.fullName || "Client",
      lawyerUsername: selectedLawyer.email,
      lawyerId: selectedLawyer._id,
      status: "In Progress",
      progress: 25,
      tags: newCase.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    dispatch(addCaseItem(caseToAdd));
    setNewCase({
      title: "",
      caseType: "Civil",
      description: "",
      tags: "",
      lawyerUsername: "",
    });
    setSelectedLawyer(null);
    setShowAddCaseModal(false);
    dispatch(fetchCases());

    // alert("Case added successfully!");
  };

  // Handle Add Document
  const handleAddDocument = async () => {
    if (!newDocument) {
      return;
    }
    if (!selectedCase) {
      return;
    }

    try {
      await dispatch(
        addDocumentAsync({
          file: newDocument,
          caseId: selectedCase.id,
        })
      ).unwrap();

      setNewDocument(null);
      setShowAddDocModal(false);
      alert(`Document "${newDocument.name}" uploaded successfully!`);
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert(`Failed to upload document: ${error}`);
    }
  };

  const userId = currentUser?._id;

  const filteredCases = cases;

  return (
    <div style={styles.pageWrapper}>
      <Container fluid style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.titleRow}>
            <h1 style={styles.title}>
              <FiBriefcase style={{ marginRight: "12px" }} />
              {currentUser?.role === "lawyer" ? "Manage Cases" : "My Cases"}
            </h1>
            {currentUser?.role === "client" && (
              <div style={styles.clientActions}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddCaseModal(true)}
                  style={styles.addCaseButton}
                >
                  <FiPlus style={{ marginRight: "8px" }} />
                  Add New Case
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!selectedCase) {
                      // alert("Please select a case first to add document");
                      return;
                    }
                    setShowAddDocModal(true);
                  }}
                  style={styles.addDocButton}
                >
                  <FiUpload style={{ marginRight: "8px" }} />
                  Add Document
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        <Row>
          {/* Cases List */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card style={styles.listPanel}>
                <div style={styles.listHeader}>
                  <h2 style={styles.listTitle}>
                    Cases
                    <Badge style={styles.countBadge}>
                      {filteredCases.length}
                    </Badge>
                  </h2>
                </div>
                <div style={styles.casesList}>
                  {filteredCases.map((c, index) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedCase(c)}
                      style={{
                        ...styles.caseItem,
                        ...(selectedCase?.id === c.id && styles.caseItemActive),
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <div style={styles.caseItemHeader}>
                        <h3 style={styles.caseItemTitle}>{c.title}</h3>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: statusColors[c.status]?.bg,
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p style={styles.caseItemClient}>
                        <FiUser size={12} style={{ marginRight: "6px" }} />
                        {c.clientId?.fullName || c.client}
                      </p>
                      <div style={styles.caseItemMeta}>
                        {c.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} style={styles.miniTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Case Details */}
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card style={styles.detailsPanel}>
                {selectedCase ? (
                  <motion.div
                    key={selectedCase._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.caseDetailsHeader}>
                      <div>
                        <h2 style={styles.detailsTitle}>
                          {selectedCase.title}
                        </h2>
                        <p style={styles.detailsSubtitle}>
                          {selectedCase.caseType}
                        </p>
                      </div>
                      <span
                        style={{
                          ...styles.statusBadgeLarge,
                          background: statusColors[selectedCase.status]?.bg,
                        }}
                      >
                        {selectedCase.status}
                      </span>
                    </div>

                    <Row className="mb-4">
                      <Col md={6}>
                        <div style={styles.detailItem}>
                          <FiUser style={styles.detailIcon} />
                          <div>
                            <label style={styles.detailLabel}>Client</label>
                            <div style={styles.detailValue}>
                              {selectedCase.clientId?.fullName}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div style={styles.detailItem}>
                          <FiBriefcase style={styles.detailIcon} />
                          <div>
                            <label style={styles.detailLabel}>Lawyer</label>
                            <div style={styles.detailValue}>
                              {selectedCase.lawyerId?.fullName}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div style={styles.detailItem}>
                          <FiCalendar style={styles.detailIcon} />
                          <div>
                            <label style={styles.detailLabel}>
                              Filing Date
                            </label>
                            <div style={styles.detailValue}>
                              {new Date(
                                selectedCase.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short", // "Dec"
                                day: "2-digit", // "01"
                              })}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div style={styles.detailItem}>
                          <FiDollarSign style={styles.detailIcon} />
                          <div>
                            <label style={styles.detailLabel}>Amount</label>
                            <div style={styles.detailValue}>{"$100000"}</div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div style={styles.descriptionSection}>
                      <label style={styles.sectionLabel}>Description</label>
                      <p style={styles.descriptionText}>
                        {selectedCase.description}
                      </p>
                    </div>

                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <label style={styles.sectionLabel}>Progress</label>
                        <span style={styles.progressPercent}>{25}%</span>
                      </div>
                      <div style={styles.progressBarWrapper}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${25}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div style={styles.tagsSection}>
                      <label style={styles.sectionLabel}>
                        <FiTag style={{ marginRight: "8px" }} />
                        Tags
                      </label>
                      <div style={styles.tags}>
                        {selectedCase.tags.map((tag, i) => (
                          <motion.span
                            key={i}
                            style={styles.tag}
                            whileHover={{ scale: 1.05 }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {selectedCase.nextHearing && (
                      <motion.div
                        style={styles.nextHearingSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <FiClock style={styles.alertIcon} />
                        <div>
                          <label style={styles.alertLabel}>Next Hearing</label>
                          <div style={styles.alertValue}>
                            {selectedCase.nextHearing}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedCase.closedDate && (
                      <motion.div
                        style={styles.closedSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <FiCheckCircle style={styles.successIcon} />
                        <div>
                          <label style={styles.successLabel}>Case Closed</label>
                          <div style={styles.successValue}>
                            {selectedCase.closedDate}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div style={styles.noSelection}>
                    <div style={styles.noSelectionIcon}>📋</div>
                    <h3 style={styles.noSelectionTitle}>Select a Case</h3>
                    <p style={styles.noSelectionText}>
                      Choose a case from the list to view details
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Add Case Modal */}
      <Modal
        show={showAddCaseModal}
        onHide={() => setShowAddCaseModal(false)}
        centered
        contentClassName="bg-dark"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={styles.modalHeader}
        >
          <Modal.Title style={styles.modalTitle}>
            <FiPlus style={{ marginRight: "10px" }} />
            Add New Case
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Case Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter case title"
                value={newCase.title}
                onChange={(e) =>
                  setNewCase({ ...newCase, title: e.target.value })
                }
                style={styles.formInput}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>
                Lawyer Username *
              </Form.Label>
              <div
                onClick={() => setShowLawyerSelectModal(true)}
                style={{
                  ...styles.formInput,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: "42px",
                }}
              >
                {selectedLawyer ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{"👩‍⚖️"}</span>
                    <div>
                      <div style={{ fontWeight: "500" }}>
                        {selectedLawyer.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {selectedLawyer.specialization}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>
                    Click to select a lawyer...
                  </span>
                )}
                <FiUser style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>
              <Form.Text
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}
              >
                Click to select from available lawyers
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Case Type</Form.Label>
              <div style={styles.caseTypeGrid}>
                {[
                  "Civil",
                  "Criminal",
                  "Family",
                  "Corporate",
                  "Property",
                  "Immigration",
                  "Other",
                ].map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setNewCase({ ...newCase, caseType: type })}
                    style={{
                      ...styles.caseTypeButton,
                      ...(newCase.caseType === type &&
                        styles.caseTypeButtonActive),
                    }}
                  >
                    <span style={styles.caseTypeIcon}>
                      {type === "Civil" && "⚖️"}
                      {type === "Criminal" && "🚨"}
                      {type === "Family" && "👨‍👩‍👧"}
                      {type === "Corporate" && "🏢"}
                      {type === "Property" && "🏠"}
                      {type === "Immigration" && "✈️"}
                      {type === "Other" && "📋"}
                    </span>
                    <span style={styles.caseTypeText}>{type}</span>
                    {newCase.caseType === type && (
                      <FiCheckCircle style={styles.caseTypeCheck} />
                    )}
                  </motion.button>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe your case..."
                value={newCase.description}
                onChange={(e) =>
                  setNewCase({ ...newCase, description: e.target.value })
                }
                style={styles.formInput}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={styles.formLabel}>
                Tags (comma separated)
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., urgent, review, contract"
                value={newCase.tags}
                onChange={(e) =>
                  setNewCase({ ...newCase, tags: e.target.value })
                }
                style={styles.formInput}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setShowAddCaseModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button onClick={handleAddCase} style={styles.submitButton}>
            <FiPlus style={{ marginRight: "6px" }} />
            Add Case
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Document Modal */}
      <Modal
        show={showAddDocModal}
        onHide={() => setShowAddDocModal(false)}
        centered
        contentClassName="bg-dark"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={styles.modalHeader}
        >
          <Modal.Title style={styles.modalTitle}>
            <FiUpload style={{ marginRight: "10px" }} />
            Add Document to "{selectedCase?.title}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <div style={styles.uploadArea}>
            <input
              type="file"
              id="docUpload"
              style={{ display: "none" }}
              onChange={(e) => setNewDocument(e.target.files[0])}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
            <label htmlFor="docUpload" style={styles.uploadLabel}>
              <FiUpload size={40} style={{ marginBottom: "12px" }} />
              <p style={{ margin: 0, fontWeight: "600" }}>
                {newDocument ? newDocument.name : "Click to select a file"}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "12px", opacity: 0.6 }}>
                Supported: PDF, DOC, DOCX, TXT, JPG, PNG
              </p>
            </label>
          </div>
          {newDocument && (
            <div style={styles.filePreview}>
              <span>📄 {newDocument.name}</span>
              <span style={{ opacity: 0.6 }}>
                {(newDocument.size / 1024).toFixed(2)} KB
              </span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddDocModal(false);
              setNewDocument(null);
            }}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button onClick={handleAddDocument} style={styles.submitButton}>
            <FiUpload style={{ marginRight: "6px" }} />
            Upload Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Lawyer Selection Modal */}
      <Modal
        show={showLawyerSelectModal}
        onHide={() => setShowLawyerSelectModal(false)}
        centered
        contentClassName="bg-dark"
        size="md"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={styles.modalHeader}
        >
          <Modal.Title style={styles.modalTitle}>
            <FiUser style={{ marginRight: "10px" }} />
            Select a Lawyer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ ...styles.modalBody, maxHeight: "400px", overflowY: "auto" }}
        >
          <div style={styles.lawyerList}>
            {lawyers.map((lawyer) => (
              <motion.div
                key={lawyer.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedLawyer(lawyer);
                  setShowLawyerSelectModal(false);
                }}
                style={{
                  ...styles.lawyerCard,
                  border:
                    selectedLawyer?.id === lawyer.id
                      ? "2px solid #667eea"
                      : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={styles.lawyerAvatar}>{"👩‍⚖️"}</div>
                <div style={styles.lawyerInfo}>
                  <div style={styles.lawyerName}>{lawyer.name}</div>
                  <div style={styles.lawyerSpecialization}>
                    {lawyer.specialization}
                  </div>
                  <div style={styles.lawyerEmail}>{lawyer.email}</div>
                </div>
                <div style={styles.lawyerCaseCount}>
                  <Badge bg="primary" style={{ fontSize: "11px" }}>
                    {lawyer.caseCount} cases
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={() => setShowLawyerSelectModal(false)}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
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
  listPanel: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  },
  listHeader: {
    padding: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(102, 126, 234, 0.1)",
  },
  listTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  countBadge: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  casesList: {
    overflowY: "auto",
    maxHeight: "600px",
  },
  caseItem: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  caseItemActive: {
    background: "rgba(102, 126, 234, 0.2)",
    borderLeft: "4px solid #667eea",
  },
  caseItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  caseItemTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
    margin: "0",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  caseItemClient: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
  },
  caseItemMeta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  miniTag: {
    fontSize: "10px",
    padding: "3px 8px",
    background: "rgba(102, 126, 234, 0.2)",
    color: "#a5b4fc",
    borderRadius: "4px",
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
  caseDetailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  detailsTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 6px 0",
  },
  detailsSubtitle: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.5)",
    margin: 0,
  },
  statusBadgeLarge: {
    padding: "10px 20px",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: "12px",
  },
  detailIcon: {
    color: "#667eea",
    fontSize: "20px",
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
  sectionLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#667eea",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  descriptionSection: {
    marginBottom: "24px",
  },
  descriptionText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: "1.7",
    margin: "0",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  progressSection: {
    marginBottom: "24px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  progressPercent: {
    color: "#667eea",
    fontWeight: "700",
    fontSize: "14px",
  },
  progressBarWrapper: {
    height: "10px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "5px",
    transition: "width 0.5s ease",
  },
  tagsSection: {
    marginBottom: "24px",
  },
  tags: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tag: {
    padding: "8px 16px",
    background: "rgba(102, 126, 234, 0.15)",
    color: "#a5b4fc",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid rgba(102, 126, 234, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  nextHearingSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "rgba(251, 146, 60, 0.1)",
    borderRadius: "12px",
    marginBottom: "16px",
    border: "1px solid rgba(251, 146, 60, 0.2)",
  },
  alertIcon: {
    color: "#fb923c",
    fontSize: "24px",
  },
  alertLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
  },
  alertValue: {
    fontSize: "15px",
    color: "#fb923c",
    fontWeight: "600",
  },
  closedSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "rgba(34, 197, 94, 0.1)",
    borderRadius: "12px",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },
  successIcon: {
    color: "#22c55e",
    fontSize: "24px",
  },
  successLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
  },
  successValue: {
    fontSize: "15px",
    color: "#22c55e",
    fontWeight: "600",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  clientActions: {
    display: "flex",
    gap: "12px",
  },
  addCaseButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
  },
  addDocButton: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "20px 24px",
  },
  modalTitle: {
    color: "white",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
  },
  modalBody: {
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    padding: "24px",
  },
  modalFooter: {
    background: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px 24px",
  },
  formLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    marginBottom: "8px",
  },
  formInput: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "white",
    padding: "12px 16px",
  },
  cancelButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "white",
    padding: "10px 20px",
  },
  submitButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    padding: "10px 20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
  uploadArea: {
    border: "2px dashed rgba(255, 255, 255, 0.3)",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.7)",
  },
  filePreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(102, 126, 234, 0.2)",
    borderRadius: "10px",
    marginTop: "16px",
    color: "white",
  },
  lawyerList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  lawyerCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  lawyerAvatar: {
    fontSize: "36px",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    marginBottom: "4px",
  },
  lawyerSpecialization: {
    color: "#667eea",
    fontSize: "13px",
    fontWeight: "500",
  },
  lawyerEmail: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
    marginTop: "2px",
  },
  lawyerCaseCount: {
    display: "flex",
    alignItems: "center",
  },
  caseTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  caseTypeButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
  },
  caseTypeButtonActive: {
    background: "rgba(102, 126, 234, 0.2)",
    border: "2px solid #667eea",
    boxShadow: "0 0 15px rgba(102, 126, 234, 0.3)",
  },
  caseTypeIcon: {
    fontSize: "20px",
  },
  caseTypeText: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
  },
  caseTypeCheck: {
    color: "#667eea",
    fontSize: "16px",
  },
};
