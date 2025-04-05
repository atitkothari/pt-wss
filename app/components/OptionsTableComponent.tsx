import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { SaveScreenerModal } from '@/components/SaveScreenerModal';
import { NavBar } from '@/components/NavBar';

const OptionsTableComponent = () => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [optionType, setOptionType] = useState('call');
  const [filters, setFilters] = useState({});

  const handleSaveScreener = (data) => {
    // Implementation of handleSaveScreener
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
              onClick={() => setShowSaveModal(true)}
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
      </div>
    </div>
  );
};

export default OptionsTableComponent; 