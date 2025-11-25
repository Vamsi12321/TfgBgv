"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { Button, Input, Modal, Badge } from "../../components/ui";
import EmptyState from "../../components/EmptyState";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Paperclip,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Loader2,
  Upload,
  X,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

export default function OrgTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    category: "All",
  });

  // Create Ticket Form
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "MEDIUM",
  });
  const [attachments, setAttachments] = useState([]);
  const [creating, setCreating] = useState(false);

  // Comment
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/secure/tickets/org`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append(
        "body",
        JSON.stringify({
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
        })
      );

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch(`${API_BASE}/secure/createticket`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        setNewTicket({
          title: "",
          description: "",
          category: "General",
          priority: "MEDIUM",
        });
        setAttachments([]);
        fetchTickets();
      } else {
        alert(data.message || "Failed to create ticket");
      }
    } catch (err) {
      console.error("Error creating ticket:", err);
      alert("Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTicket) return;

    try {
      setCommenting(true);
      const res = await fetch(
        `${API_BASE}/secure/tickets/${selectedTicket._id}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: comment }),
        }
      );

      if (res.ok) {
        setComment("");
        // Refresh ticket details
        const detailRes = await fetch(
          `${API_BASE}/secure/tickets/${selectedTicket._id}`,
          {
            credentials: "include",
          }
        );
        const detailData = await detailRes.json();
        if (detailRes.ok) {
          setSelectedTicket(detailData);
        }
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setCommenting(false);
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      const res = await fetch(`${API_BASE}/secure/tickets/${ticket._id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filters.status === "All" || ticket.status === filters.status;
    const matchesPriority =
      filters.priority === "All" || ticket.priority === filters.priority;
    const matchesCategory =
      filters.category === "All" || ticket.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const variants = {
      OPEN: "warning",
      IN_PROGRESS: "info",
      RESOLVED: "success",
      CLOSED: "default",
      REOPENED: "danger",
    };
    return variants[status] || "default";
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      HIGH: "danger",
      MEDIUM: "warning",
      LOW: "success",
    };
    return variants[priority] || "default";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#ff004f] border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full bg-[#ff004f]/20 animate-ping"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-black tickets-page
"
    >
      <div className="p-4 sm:p-8">
        <PageHeader
          title="Support Tickets"
          subtitle="Create and manage your support tickets"
          breadcrumbs={["Support", "Tickets"]}
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Ticket
            </Button>
          }
        />

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
            >
              <option value="All">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
            >
              <option value="All">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="API Failure">API Failure</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets found"
            description="Create your first support ticket to get help from our team"
            action={
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Create Ticket
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#ff004f] transition-colors line-clamp-1">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getPriorityBadge(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadge(ticket.status)}>
                    {ticket.status.replace("_", " ")}
                  </Badge>
                  <button className="text-[#ff004f] hover:text-[#e60047] transition-colors flex items-center gap-1 text-sm font-medium">
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Ticket Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Support Ticket"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Brief description of your issue"
              value={newTicket.title}
              onChange={(e) =>
                setNewTicket({ ...newTicket, title: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Provide detailed information about your issue"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
                >
                  <option value="General">General</option>
                  <option value="API Failure">API Failure</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ff004f] transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="flex items-center gap-2">
                        <Paperclip size={14} />
                        {file.name}
                      </span>
                      <button
                        onClick={() =>
                          setAttachments(
                            attachments.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTicket}
                loading={creating}
                icon={Send}
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </Modal>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <Modal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title={`Ticket #${selectedTicket._id.slice(-6)}`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedTicket.title}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadge(selectedTicket.status)}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                  <Badge variant={getPriorityBadge(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedTicket.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Attachments */}
              {selectedTicket.attachments &&
                selectedTicket.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {selectedTicket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#ff004f] hover:text-[#e60047] bg-gray-50 px-3 py-2 rounded"
                        >
                          <Paperclip size={14} />
                          {att.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Comments */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {selectedTicket.comments &&
                  selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {c.commentedBy}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(c.commentedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{c.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet
                    </p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f] outline-none"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddComment}
                    loading={commenting}
                    icon={Send}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
