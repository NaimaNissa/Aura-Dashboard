'use client';

import { useState, useEffect } from 'react';
import { Check, X, User, Mail, Calendar, MessageSquare, Clock, UserCheck, UserX } from 'lucide-react';
import SimpleNav from '../../components/SimpleNav';

export default function UserApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState(''); // approve or reject

  // Load approval requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      console.log('👤 Loading approval requests...');
      
      const { getAllApprovalRequests } = await import('../../lib/userApprovalService');
      const requestsData = await getAllApprovalRequests();
      
      console.log('👤 Requests loaded:', requestsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      setError('Failed to load approval requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve user request
  const handleApprove = async (requestId) => {
    try {
      setError(null);
      console.log('👤 Approving request:', requestId);
      
      const { approveUserRequest } = await import('../../lib/userApprovalService');
      await approveUserRequest(requestId, 'admin@auratech.com', notes); // TODO: Get actual admin email
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: 'admin@auratech.com', notes }
            : req
        )
      );
      
      setShowNotesModal(false);
      setNotes('');
      setSuccess('User request approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error approving request:', error);
      setError('Failed to approve request: ' + error.message);
    }
  };

  // Reject user request
  const handleReject = async (requestId) => {
    try {
      setError(null);
      console.log('👤 Rejecting request:', requestId);
      
      const { rejectUserRequest } = await import('../../lib/userApprovalService');
      await rejectUserRequest(requestId, 'admin@auratech.com', notes); // TODO: Get actual admin email
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: 'admin@auratech.com', notes }
            : req
        )
      );
      
      setShowNotesModal(false);
      setNotes('');
      setSuccess('User request rejected successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      setError('Failed to reject request: ' + error.message);
    }
  };

  // Open notes modal
  const openNotesModal = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setNotes('');
    setShowNotesModal(true);
  };

  // Handle notes modal action
  const handleNotesAction = () => {
    if (actionType === 'approve') {
      handleApprove(selectedRequest.id);
    } else if (actionType === 'reject') {
      handleReject(selectedRequest.id);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <UserX className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Approvals</h1>
              <p className="text-gray-600 mt-2">Manage admin access requests</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={loadRequests}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading approval requests...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Approval Requests ({filteredRequests.length})
              </h2>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {filter === 'all' 
                    ? 'No approval requests have been submitted yet'
                    : `No ${filter} requests found`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.displayName || 'Unknown User'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {request.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.role || 'admin'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {request.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openNotesModal(request, 'approve')}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => openNotesModal(request, 'reject')}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {request.reviewedAt && (
                                <div>
                                  Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                                </div>
                              )}
                              {request.reviewedBy && (
                                <div>By: {request.reviewedBy}</div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'approve' ? 'Approve' : 'Reject'} User Request
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  User: <strong>{selectedRequest?.displayName}</strong> ({selectedRequest?.email})
                </p>
                <p className="text-sm text-gray-600">
                  Reason: {selectedRequest?.reason || 'No reason provided'}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this decision..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleNotesAction}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Request
                </button>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
