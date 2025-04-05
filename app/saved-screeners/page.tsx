'use client';

import { useEffect, useState } from 'react';
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { SavedScreener, EmailFrequency } from '../types/screener';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Bell, BellOff, Star, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { defaultScreeners } from '../config/defaultScreeners';
import { EditScreenerModal } from '../components/modals/EditScreenerModal';

export default function SavedScreenersPage() {
  const { user } = useAuth();
  const [screeners, setScreeners] = useState<SavedScreener[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScreener, setEditingScreener] = useState<SavedScreener | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedScreeners();
  }, []);

  const loadSavedScreeners = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedScreeners = localStorage.getItem('savedScreeners');
      if (savedScreeners) {
        const parsedScreeners = JSON.parse(savedScreeners);
        // Validate that parsedScreeners is an array
        if (!Array.isArray(parsedScreeners)) {
          console.error('Saved screeners is not an array');
          localStorage.removeItem('savedScreeners');
          setScreeners([]);
        } else {
          // Filter out any invalid screeners
          const validScreeners = parsedScreeners.filter(screener => 
            screener && 
            typeof screener === 'object' && 
            typeof screener.id === 'string' &&
            typeof screener.name === 'string' &&
            typeof screener.optionType === 'string' &&
            typeof screener.createdAt === 'string'
          );
          setScreeners(validScreeners);
        }
      } else {
        setScreeners([]);
      }
    } catch (e) {
      console.error('Error loading saved screeners:', e);
      // If there's an error, clear the invalid data
      localStorage.removeItem('savedScreeners');
      setScreeners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const updatedScreeners = screeners.filter(screener => 
      screener.id !== id && !screener.isDefault
    );
    localStorage.setItem('savedScreeners', JSON.stringify(updatedScreeners.filter(s => !s.isDefault)));
    setScreeners(updatedScreeners);
  };

  const handleToggleEmailNotifications = (id: string) => {
    const updatedScreeners = screeners.map(screener => {
      if (screener.id === id) {
        return {
          ...screener,
          emailNotifications: screener.emailNotifications?.enabled
            ? undefined
            : {
                enabled: true,
                email: user?.email || '',
                frequency: 'daily' as EmailFrequency
              }
        };
      }
      return screener;
    });
    localStorage.setItem('savedScreeners', JSON.stringify(updatedScreeners.filter(s => !s.isDefault)));
    setScreeners(updatedScreeners);
  };

  const handleUpdateFrequency = (id: string, frequency: EmailFrequency) => {
    const updatedScreeners = screeners.map(screener => {
      if (screener.id === id && screener.emailNotifications) {
        return {
          ...screener,
          emailNotifications: {
            ...screener.emailNotifications,
            frequency
          }
        };
      }
      return screener;
    });
    localStorage.setItem('savedScreeners', JSON.stringify(updatedScreeners.filter(s => !s.isDefault)));
    setScreeners(updatedScreeners);
  };

  const handleEditScreener = (screener: SavedScreener) => {
    setEditingScreener(screener);
  };

  const handleSaveEdit = (updatedScreener: SavedScreener) => {
    const updatedScreeners = screeners.map(screener => 
      screener.id === updatedScreener.id ? updatedScreener : screener
    );
    localStorage.setItem('savedScreeners', JSON.stringify(updatedScreeners));
    setScreeners(updatedScreeners);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderFilterDetails = (screener: SavedScreener) => {
    const { filters } = screener;
    return (
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filters.searchTerm && (
            <div className="text-sm">
              <span className="font-medium">Symbol:</span> {filters.searchTerm}
            </div>
          )}
          {filters.minPrice !== undefined && filters.maxPrice !== undefined && (
            <div className="text-sm">
              <span className="font-medium">Price Range:</span> ${filters.minPrice} - ${filters.maxPrice}
            </div>
          )}
          {filters.volumeRange && (
            <div className="text-sm">
              <span className="font-medium">Volume Range:</span> {filters.volumeRange[0]} - {filters.volumeRange[1]}
            </div>
          )}
          {filters.yieldRange && (
            <div className="text-sm">
              <span className="font-medium">Yield Range:</span> {filters.yieldRange[0]}% - {filters.yieldRange[1]}%
            </div>
          )}
          {filters.deltaFilter && (
            <div className="text-sm">
              <span className="font-medium">Delta Range:</span> {filters.deltaFilter[0]} - {filters.deltaFilter[1]}
            </div>
          )}
          {filters.moneynessRange && (
            <div className="text-sm">
              <span className="font-medium">Moneyness Range:</span> {filters.moneynessRange[0]}% - {filters.moneynessRange[1]}%
            </div>
          )}
          {filters.minDte !== undefined && filters.maxDte !== undefined && (
            <div className="text-sm">
              <span className="font-medium">DTE Range:</span> {filters.minDte} - {filters.maxDte} days
            </div>
          )}
          {filters.impliedVolatility && (
            <div className="text-sm">
              <span className="font-medium">IV Range:</span> {filters.impliedVolatility[0]}% - {filters.impliedVolatility[1]}%
            </div>
          )}
          {filters.peRatio && (
            <div className="text-sm">
              <span className="font-medium">P/E Range:</span> {filters.peRatio[0]} - {filters.peRatio[1]}
            </div>
          )}
          {filters.marketCap && (
            <div className="text-sm">
              <span className="font-medium">Market Cap Range:</span> ${filters.marketCap[0]}B - ${filters.marketCap[1]}B
            </div>
          )}
          {filters.sector && (
            <div className="text-sm">
              <span className="font-medium">Sector:</span> {Array.isArray(filters.sector) ? filters.sector.join(', ') : filters.sector}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-screen-2xl mx-auto p-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Saved Screeners</h1>
        </div>

        {/* Covered Call Screeners Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Covered Call Screeners</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%]"></TableHead>
                  <TableHead className="w-[35%]">Name</TableHead>
                  <TableHead className="w-[30%]">Notifications</TableHead>
                  <TableHead className="w-[30%]">Actions</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screeners
                  .filter(screener => screener.optionType === 'call')
                  .map((screener) => (
                    <>
                      <TableRow 
                        key={screener.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(screener.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            {expandedRows.has(screener.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {screener.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleEmailNotifications(screener.id);
                              }}
                              className="h-8 w-8"
                            >
                              {screener.emailNotifications?.enabled ? (
                                <Bell className="h-4 w-4 text-green-600" />
                              ) : (
                                <BellOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            {screener.emailNotifications?.enabled && (
                              <Select
                                value={screener.emailNotifications.frequency}
                                onValueChange={(value: EmailFrequency) =>
                                  handleUpdateFrequency(screener.id, value)
                                }
                              >
                                <SelectTrigger className="h-8 w-[100px]" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScreener(screener);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!screener.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(screener.id);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(screener.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(screener.id) && (
                        <TableRow>
                          <td colSpan={5} className="p-0">
                            {renderFilterDetails(screener)}
                          </td>
                        </TableRow>
                      )}
                    </>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Cash Secured Put Screeners Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cash Secured Put Screeners</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%]"></TableHead>
                  <TableHead className="w-[35%]">Name</TableHead>
                  <TableHead className="w-[30%]">Notifications</TableHead>
                  <TableHead className="w-[30%]">Actions</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screeners
                  .filter(screener => screener.optionType === 'put')
                  .map((screener) => (
                    <>
                      <TableRow 
                        key={screener.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(screener.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            {expandedRows.has(screener.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {screener.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleEmailNotifications(screener.id);
                              }}
                              className="h-8 w-8"
                            >
                              {screener.emailNotifications?.enabled ? (
                                <Bell className="h-4 w-4 text-green-600" />
                              ) : (
                                <BellOff className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            {screener.emailNotifications?.enabled && (
                              <Select
                                value={screener.emailNotifications.frequency}
                                onValueChange={(value: EmailFrequency) =>
                                  handleUpdateFrequency(screener.id, value)
                                }
                              >
                                <SelectTrigger className="h-8 w-[100px]" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScreener(screener);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!screener.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(screener.id);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(screener.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(screener.id) && (
                        <TableRow>
                          <td colSpan={5} className="p-0">
                            {renderFilterDetails(screener)}
                          </td>
                        </TableRow>
                      )}
                    </>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Screener Modal */}
        {editingScreener && (
          <EditScreenerModal
            isOpen={!!editingScreener}
            onClose={() => setEditingScreener(null)}
            onSave={handleSaveEdit}
            screener={editingScreener}
          />
        )}

        <Footer />
      </div>
    </div>
  );
} 