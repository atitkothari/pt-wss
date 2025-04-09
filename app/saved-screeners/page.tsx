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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { defaultScreeners } from '../config/defaultScreeners';
import { EditScreenerModal } from '../components/modals/EditScreenerModal';
import { screenerService } from '../services/screenerService';
import { auth } from '../config/firebase';

export default function SavedScreenersPage() {
  const { user, signInWithGoogle, userId } = useAuth();
  const [screeners, setScreeners] = useState<SavedScreener[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScreener, setEditingScreener] = useState<SavedScreener | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [screenerToDelete, setScreenerToDelete] = useState<SavedScreener | null>(null);

  useEffect(() => {
    loadSavedScreeners();
  }, [userId]);


  const loadSavedScreeners = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const fetchScreener = await screenerService.fetchFilter({user_id: userId??''})
      
      // Convert API response to SavedScreener format
      const convertedScreeners = fetchScreener.map((screener: any) => {
        const parsedFilters = JSON.parse(screener.filter);
        return {
          id: screener.id.toString(),
          name: screener.filter_name,
          filters: {
            ...parsedFilters,
            optionType: parsedFilters.optionType || 'call' // Default to call if not specified
          },
          createdAt: screener.created_date,
          updatedAt: screener.last_updated_date,
          emailNotifications: screener.is_alerting ? {
            enabled: true,
            email: user?.email || '',
            frequency: 'daily' as EmailFrequency
          } : undefined
        };
      });

      setScreeners(convertedScreeners);
    } catch (e) {
      console.error('Error loading saved screeners:', e);
      setScreeners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the screener to delete
      const screenerToDelete = screeners.find(s => s.id === id);
      if (!screenerToDelete) return;

      // Delete from backend
      await screenerService.deleteFilter(id);

      // Update local state
      const updatedScreeners = screeners.filter(screener => screener.id !== id);
      setScreeners(updatedScreeners);
    } catch (e) {
      console.error('Error deleting screener:', e);
    }
  };

  const handleToggleEmailNotifications = async (id: string) => {
    try {
      // Find the screener to update
      const screenerToUpdate = screeners.find(s => s.id === id);
      if (!screenerToUpdate) return;

      // Determine if we're enabling or disabling notifications
      const isEnabling = !screenerToUpdate.emailNotifications?.enabled;
      const newFrequency = isEnabling ? 'daily' as EmailFrequency : screenerToUpdate.emailNotifications?.frequency;

      // Update the screener in the backend
      await screenerService.updateFilter({
        filter_id: id,
        filter_name: screenerToUpdate.name,
        is_alerting: isEnabling,
        frequency: newFrequency || 'daily',
        filters: JSON.parse(JSON.stringify(screenerToUpdate.filters))
      });

      // Update the local state
      const updatedScreeners = screeners.map(screener => {
        if (screener.id === id) {
          return {
            ...screener,
            emailNotifications: isEnabling
              ? {
                  enabled: true,
                  email: user?.email || '',
                  frequency: newFrequency || 'daily'
                }
              : undefined
          };
        }
        return screener;
      });
      setScreeners(updatedScreeners);
    } catch (e) {
      console.error('Error toggling email notifications:', e);
    }
  };

  const handleUpdateFrequency = async (id: string, frequency: EmailFrequency) => {
    try {
      // Find the screener to update
      const screenerToUpdate = screeners.find(s => s.id === id);
      if (!screenerToUpdate) return;

      // Update the screener in the backend
      await screenerService.updateFilter({
        filter_id: id,
        filter_name: screenerToUpdate.name,
        is_alerting: true,
        frequency,
        filters: JSON.parse(JSON.stringify(screenerToUpdate.filters))
      });

      // Update the local state
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
      setScreeners(updatedScreeners);
    } catch (e) {
      console.error('Error updating screener frequency:', e);
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-screen-2xl mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to View Saved Screeners</h1>
            <p className="text-gray-600 mb-6">Please sign in with your Google account to access your saved screeners.</p>
            <Button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
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
                  .filter(screener => screener.filters.optionType === 'call')
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
                                  setScreenerToDelete(screener);
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
                  .filter(screener => screener.filters.optionType === 'put')
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
                                  setScreenerToDelete(screener);
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!screenerToDelete} onOpenChange={() => setScreenerToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Screener</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the screener "{screenerToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (screenerToDelete) {
                  handleDelete(screenerToDelete.id);
                  setScreenerToDelete(null);
                }
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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