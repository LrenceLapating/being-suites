import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Plus, 
  RefreshCw,
  AlertCircle,
  Info,
  Calendar,
  Trash2
} from 'lucide-react';
import { 
  getCurrentRoomAvailability, 
  getAllRoomBlocks,
  deleteRoomBlock,
  RoomAvailability,
  RoomAvailabilityAdjustment,
  ROOM_INVENTORY
} from '../../services/roomAvailabilityService';
import RoomBlockModal from './RoomBlockModal';

interface RoomAvailabilityTrackerProps {
  onUpdate?: () => void;
}

const RoomAvailabilityTracker: React.FC<RoomAvailabilityTrackerProps> = ({ onUpdate }) => {
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [roomBlocks, setRoomBlocks] = useState<RoomAvailabilityAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [deletingBlock, setDeletingBlock] = useState<string | null>(null);

  const roomNames = {
    regular: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Twin Bed',
  };

  const roomColors = {
    regular: {
      bg: 'from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
    },
    deluxe: {
      bg: 'from-[#1B4B9E] to-[#2563B8]',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    },
    suite: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
    },
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds (same interval as the calendar)
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [availabilityData, blocksData] = await Promise.all([
        getCurrentRoomAvailability(),
        getAllRoomBlocks()
      ]);
      setAvailability(availabilityData);
      setRoomBlocks(blocksData);
    } catch (err) {
      console.error('Error loading room data:', err);
      setError('Failed to load room availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Remove this room block?')) return;

    try {
      setDeletingBlock(blockId);
      await deleteRoomBlock(blockId);
      await loadData();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error deleting block:', err);
      setError('Failed to delete room block');
    } finally {
      setDeletingBlock(null);
    }
  };

  const handleBlockSuccess = async () => {
    await loadData();
    if (onUpdate) {
      onUpdate();
    }
  };

  const getAvailabilityStatus = (room: RoomAvailability) => {
    const percentage = (room.available_rooms / room.total_rooms) * 100;
    
    if (percentage === 0) return { color: 'text-red-600', status: 'Full' };
    if (percentage <= 25) return { color: 'text-orange-600', status: 'Low' };
    if (percentage <= 50) return { color: 'text-yellow-600', status: 'Medium' };
    return { color: 'text-green-600', status: 'Good' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="h-6 w-6 text-[#1B4B9E] animate-spin" />
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col items-center justify-center py-6 text-red-600">
          <AlertCircle className="h-6 w-6 mb-2" />
          <span className="text-sm text-center">{error}</span>
          <button
            onClick={loadData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Room Availability</h3>
            <p className="text-xs text-gray-500">Current availability</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 text-gray-500 hover:text-[#1B4B9E] hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] text-white rounded-md hover:from-[#2563B8] hover:to-[#1B4B9E] transition-all text-xs"
          >
            <Plus className="h-3 w-3" />
            Block
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Room Availability Cards */}
        <div className="space-y-3 mb-4">
          {availability.map((room) => {
            const colors = roomColors[room.room_type];
            const status = getAvailabilityStatus(room);

            return (
              <motion.div
                key={room.room_type}
                layout
                className={`${colors.light} ${colors.border} border rounded-lg p-3 transition-all hover:shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold text-sm ${colors.text}`}>
                    {roomNames[room.room_type]}
                  </h4>
                  <span className={`text-sm font-bold ${status.color}`}>
                    {room.available_rooms}/{room.total_rooms}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                    className={`bg-gradient-to-r ${colors.bg} h-1.5 rounded-full transition-all`}
                    style={{
                      width: `${Math.max(5, (room.available_rooms / room.total_rooms) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Booked: {room.booked_rooms}</span>
                  <span>Blocked: {room.blocked_rooms}</span>
                  <span className={`font-medium ${status.color}`}>
                    {status.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Current Room Blocks */}
        {roomBlocks.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1B4B9E]" />
              Active Room Blocks
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {roomBlocks.map((block) => {
                const colors = roomColors[block.room_type];
                const isDeleting = deletingBlock === block.id;
                
                return (
                  <motion.div
                    key={block.id}
                    layout
                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-between hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.bg} flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs text-gray-900 truncate">
                            {roomNames[block.room_type]}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({block.adjustment_count})
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {new Date(block.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            timeZone: 'UTC'
                          })} - {new Date(block.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            timeZone: 'UTC'
                          })}
                        </div>
                        {block.reason && (
                          <div className="text-xs text-gray-500 truncate">
                            {block.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      disabled={isDeleting}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 mt-4">
          <Info className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Room Blocking</p>
            <p>
              Block rooms for external bookings. Blocked rooms affect guest booking availability.
            </p>
          </div>
        </div>
      </div>

      {/* Room Block Modal */}
      <RoomBlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSuccess={handleBlockSuccess}
      />
    </div>
  );
};

export default RoomAvailabilityTracker;