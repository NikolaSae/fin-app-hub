// components/parking-services/ParkingServiceContacts.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, User, Building2, AlertCircle } from "lucide-react";

interface ParkingService {
  id: string;
  name: string;
  description?: string;
  contactName?: string;
  email?: string;
  additionalEmails?: string[];
  phone?: string;
  address?: string;
  isActive: boolean;
}

interface ParkingServiceContactsProps {
  parkingService: ParkingService;
}

export default function ParkingServiceContacts({ parkingService }: ParkingServiceContactsProps) {
  
  const handleSendEmail = (email: string) => {
    // Otvara Outlook sa predefinisanim email-om
    const outlookUrl = `mailto:${email}?subject=Regarding ${parkingService.name} Services`;
    window.location.href = outlookUrl;
  };

  const handleCallPhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-6">
      {/* Provider Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Parking Service Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{parkingService.name}</h3>
              {parkingService.description && (
                <p className="text-muted-foreground mt-1">{parkingService.description}</p>
              )}
            </div>
            <Badge variant={parkingService.isActive ? "default" : "secondary"}>
              {parkingService.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Name */}
          {parkingService.contactName && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-32">Contact Person:</span>
              <span>{parkingService.contactName}</span>
            </div>
          )}

          {/* Primary Email with action button */}
          {parkingService.email && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Primary Email</p>
                  <p className="text-sm text-muted-foreground">{parkingService.email}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleSendEmail(parkingService.email)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          )}

          {/* Additional Emails */}
          {parkingService.additionalEmails && parkingService.additionalEmails.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm text-muted-foreground">Additional Email Addresses:</p>
              {parkingService.additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Additional Email {index + 1}</p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendEmail(email)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Phone with action button */}
          {parkingService.phone && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{parkingService.phone}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCallPhone(parkingService.phone)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          )}

          {/* Address with action button */}
          {parkingService.address && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{parkingService.address}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parkingService.address)}`;
                  window.open(mapsUrl, '_blank');
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Map
              </Button>
            </div>
          )}

          {/* Ako nema kontakt informacija */}
          {!parkingService.contactName && !parkingService.email && !parkingService.phone && !parkingService.address && 
           (!parkingService.additionalEmails || parkingService.additionalEmails.length === 0) && (
            <div className="flex items-center text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              No contact information available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      {(parkingService.email || (parkingService.additionalEmails && parkingService.additionalEmails.length > 0) || 
        parkingService.phone || parkingService.address) && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {parkingService.email && (
                <Button onClick={() => handleSendEmail(parkingService.email)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Primary Email
                </Button>
              )}
              
              {parkingService.additionalEmails && parkingService.additionalEmails.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Kreira email sa svim email adresama u CC
                    const allEmails = [parkingService.email, ...parkingService.additionalEmails].filter(Boolean).join(',');
                    const outlookUrl = `mailto:${allEmails}?subject=Regarding ${parkingService.name} Services`;
                    window.location.href = outlookUrl;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email All Contacts
                </Button>
              )}
              
              {parkingService.phone && (
                <Button variant="outline" onClick={() => handleCallPhone(parkingService.phone)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              )}
              
              {parkingService.address && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parkingService.address)}`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}