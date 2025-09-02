import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDispatchApplications } from '@/hooks/useDispatchApplications';
import { useUserTypes } from '@/hooks/useUserTypes';
import { Loader2 } from 'lucide-react';

interface DispatchApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DispatchApplicationForm = ({ open, onOpenChange }: DispatchApplicationFormProps) => {
  const { submitApplication } = useDispatchApplications();
  const { addUserType } = useUserTypes();
  
  const [formData, setFormData] = useState({
    dispatch_name: '',
    vehicle_type: '',
    phone_number: '',
    availability: '',
    experience_years: '',
    coverage_areas: [] as string[],
    license_number: '',
    email: '',
    emergency_contact: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const vehicleTypes = [
    'Motorcycle',
    'Car',
    'Van',
    'Bicycle',
    'Scooter',
    'Truck'
  ];

  const availabilityOptions = [
    'Full-time (40+ hours/week)',
    'Part-time (20-40 hours/week)',
    'Weekends only',
    'Evenings only',
    'Flexible schedule'
  ];

  const coverageAreas = [
    'Downtown',
    'Suburbs',
    'Industrial area',
    'Shopping districts',
    'Residential areas',
    'All areas'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    
    const applicationData = {
      ...formData,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
    };

    const result = await submitApplication(applicationData);
    
    if (result?.error === null) {
      // Add user type as dispatch
      await addUserType('dispatch');
      
      // Reset form
      setFormData({
        dispatch_name: '',
        vehicle_type: '',
        phone_number: '',
        availability: '',
        experience_years: '',
        coverage_areas: [],
        license_number: '',
        email: '',
        emergency_contact: '',
      });
      setAgreedToTerms(false);
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  const handleCoverageAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        coverage_areas: [...prev.coverage_areas, area]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        coverage_areas: prev.coverage_areas.filter(a => a !== area)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispatch Application</DialogTitle>
          <DialogDescription>
            Apply to become a dispatcher and start earning by delivering products.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dispatch_name">Dispatch Business Name</Label>
              <Input
                id="dispatch_name"
                type="text"
                value={formData.dispatch_name}
                onChange={(e) => setFormData(prev => ({ ...prev, dispatch_name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone_number">WhatsApp Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="+1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                type="tel"
                value={formData.emergency_contact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="license_number">Driver's License Number</Label>
              <Input
                id="license_number"
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience_years">Years of Delivery Experience</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Coverage Areas (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {coverageAreas.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.coverage_areas.includes(area)}
                    onCheckedChange={(checked) => handleCoverageAreaChange(area, checked as boolean)}
                  />
                  <Label htmlFor={area} className="text-sm">
                    {area}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Terms and Conditions & Privacy Policy</h3>
            <p className="text-sm text-gray-600 mb-3">
              By applying as a dispatcher, you agree to:
            </p>
            <ul className="text-xs text-gray-600 space-y-1 mb-3">
              <li>• Provide reliable and professional delivery services</li>
              <li>• Maintain vehicle insurance and valid driver's license</li>
              <li>• Handle products with care and ensure timely delivery</li>
              <li>• Follow all traffic laws and safety regulations</li>
              <li>• No delivery of immoral, illegal, or prohibited products</li>
              <li>• Maintain customer confidentiality and professionalism</li>
            </ul>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions and privacy policy
              </Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !agreedToTerms}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};