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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {donor ? 'Edit Donor' : 'Add New Donor'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Donor Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter donor name"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {donor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Donors</h1>
          <p className="text-gray-500 mt-1">Manage project donors and contributors</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Donor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donors..."
          className="input-field pl-10"
        />
      </div>

      {/* Donors Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => (
            <div key={donor.donorId} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUsers className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{donor.name}</p>
                  <p className="text-sm text-gray-500">ID: {donor.donorId}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingDonor(donor)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this donor?')) {
                      deleteMutation.mutate(donor.donorId);
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredDonors.length === 0 && (
            <p className="text-center text-gray-500 col-span-full py-8">No donors found</p>
          )}
        </div>
      )}

      {/* Modal */}
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
