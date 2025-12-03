import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers } from 'react-icons/fi';

function DonorModal({ donor, onClose, onSave }) {
  const [name, setName] = useState(donor?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {donor ? 'Edit Donor' : 'Add New Donor'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Donor Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="Enter donor name"
                  required
                />
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {donor ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Donors() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const queryClient = useQueryClient();

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const response = await donorAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => donorAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['donors']);
      toast.success('Donor created successfully');
      setModalOpen(false);
    },
    onError: () => toast.error('Failed to create donor'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => donorAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['donors']);
      toast.success('Donor updated successfully');
      setEditingDonor(null);
    },
    onError: () => toast.error('Failed to update donor'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => donorAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['donors']);
      toast.success('Donor deleted successfully');
    },
    onError: () => toast.error('Failed to delete donor'),
  });

  const filteredDonors = donors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data) => {
    if (editingDonor) {
      updateMutation.mutate({ id: editingDonor.donorId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">Donors</h1>
          <p className="text-muted mb-0">Manage project donors and contributors</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <FiPlus /> Add Donor
        </button>
      </div>

      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-white border-end-0">
            <FiSearch className="text-muted" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donors..."
            className="form-control border-start-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredDonors.map((donor) => (
            <div key={donor.donorId} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                      style={{ width: '48px', height: '48px', minWidth: '48px' }}
                    >
                      <FiUsers className="text-primary" size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{donor.name}</h6>
                      <small className="text-muted">ID: {donor.donorId}</small>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      onClick={() => setEditingDonor(donor)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this donor?')) {
                          deleteMutation.mutate(donor.donorId);
                        }
                      }}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredDonors.length === 0 && (
            <div className="col-12">
              <p className="text-center text-muted py-5">No donors found</p>
            </div>
          )}
        </div>
      )}

      {(modalOpen || editingDonor) && (
        <DonorModal
          donor={editingDonor}
          onClose={() => {
            setModalOpen(false);
            setEditingDonor(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Donors;
