import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { NavBar } from './NavBar';
import { SaveScreenerModal } from './modals/SaveScreenerModal';
import { useAuth } from '../context/AuthContext';
import { LoginPromptModal } from './modals/LoginPromptModal';
import { SavedScreener } from '../types/screener';
import { defaultScreeners } from '../config/defaultScreeners';

const OptionsTableComponent = () => {
  const { user } = useAuth();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: 0,
    maxPrice: 1000,
    volumeRange: [0, 1000000],
    yieldRange: [0, 100],
    deltaFilter: [-1, 1],
    moneynessRange: [-50, 50],
    minDte: 0,
    maxDte: 365,
    impliedVolatility: [0, 500],
    peRatio: [0, 100],
    marketCap: [0, 1000],
    sector: []
  });

  const handleSaveScreener = (data: SavedScreener) => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedScreeners = localStorage.getItem('savedScreeners');
      const screeners = savedScreeners ? JSON.parse(savedScreeners) : [];
      screeners.push(data);
      localStorage.setItem('savedScreeners', JSON.stringify(screeners));
      setShowSaveModal(false);
    } catch (e) {
      console.error('Error saving screener:', e);
    }
  };

  const handleSaveScreenerClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setShowSaveModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            {optionType === 'call' ? 'Covered Call Screener' : 'Cash Secured Put Screener'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <Table>
            {/* ... existing table code ... */}
          </Table>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md p-4 z-50">
          <div className="max-w-screen-2xl mx-auto flex justify-end">
            <Button
              onClick={handleSaveScreenerClick}
              className="bg-primary hover:bg-primary/90"
            >
              Save Screener
            </Button>
          </div>
        </div>

        <div className="h-20" />

        {showSaveModal && (
          <SaveScreenerModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveScreener}
            optionType={optionType}
            filters={filters}
          />
        )}

        {showLoginPrompt && (
          <LoginPromptModal
            isOpen={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OptionsTableComponent; 