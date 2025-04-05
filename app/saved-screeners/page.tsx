'use client';

import { useEffect, useState } from 'react';
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { SavedScreener, EmailFrequency } from '../types/screener';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Bell, BellOff, Star } from "lucide-react";
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

export default function SavedScreenersPage() {
  const { user } = useAuth();
  const [screeners, setScreeners] = useState<SavedScreener[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedScreeners();
  }, []);

  const loadSavedScreeners = () => {
    if (typeof window === 'undefined') return;
    
    const savedScreeners = localStorage.getItem('savedScreeners');
    if (savedScreeners) {
      try {
        const parsedScreeners = JSON.parse(savedScreeners);
        setScreeners(parsedScreeners);
      } catch (e) {
        console.error('Error parsing saved screeners:', e);
        setScreeners([]);
      }
    } else {
      setScreeners([]);
    }
    setLoading(false);
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
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-[30%]">Notifications</TableHead>
                  <TableHead className="w-[30%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screeners
                  .filter(screener => screener.optionType === 'call')
                  .map((screener) => (
                    <TableRow key={screener.id}>
                      <TableCell className="font-medium">
                        {screener.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(screener.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleEmailNotifications(screener.id)}
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
                              <SelectTrigger className="h-8 w-[100px]">
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
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log('Edit screener:', screener.id);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!screener.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(screener.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
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
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-[30%]">Notifications</TableHead>
                  <TableHead className="w-[30%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screeners
                  .filter(screener => screener.optionType === 'put')
                  .map((screener) => (
                    <TableRow key={screener.id}>
                      <TableCell className="font-medium">
                        {screener.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(screener.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleEmailNotifications(screener.id)}
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
                              <SelectTrigger className="h-8 w-[100px]">
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
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log('Edit screener:', screener.id);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!screener.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(screener.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
} 