import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Filter, X, Shirt, Palette, Ruler, Layers, DollarSign, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductFiltersProps {
  categories: string[];
  productTypes: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  filters: {
    categories: string[];
    types: string[];
    genders: string[];
    colors: string[];
    sizes: string[];
    materials: string[];
    thickness: string[];
    priceRange: [number, number];
  };
  onFiltersChange: (filters: ProductFiltersProps['filters']) => void;
  maxPrice: number;
}

const GENDERS = ['Male', 'Female', 'Unisex'];
const THICKNESS_OPTIONS = ['Light', 'Medium', 'Thick', 'Heavy'];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  productTypes,
  colors,
  sizes,
  materials,
  filters,
  onFiltersChange,
  maxPrice
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleFilter = (filterType: keyof typeof filters, value: string) => {
    if (filterType === 'priceRange') return;
    const current = filters[filterType] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [filterType]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      types: [],
      genders: [],
      colors: [],
      sizes: [],
      materials: [],
      thickness: [],
      priceRange: [0, maxPrice]
    });
  };

  const activeFilterCount = [
    filters.categories,
    filters.types,
    filters.genders,
    filters.colors,
    filters.sizes,
    filters.materials,
    filters.thickness
  ].flat().length + (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  // Mobile compact sidebar filter buttons
  const MobileCompactFilters = () => (
    <div className="flex flex-col gap-2">
      {/* Category */}
      <Button
        variant={filters.categories.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1"
        onClick={() => setActiveSection('category')}
      >
        <Shirt className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Category</span>
        {filters.categories.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center">
            {filters.categories.length}
          </Badge>
        )}
      </Button>

      {/* Gender */}
      <Button
        variant={filters.genders.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1 relative"
        onClick={() => setActiveSection('gender')}
      >
        <User className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Gender</span>
        {filters.genders.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center">
            {filters.genders.length}
          </Badge>
        )}
      </Button>

      {/* Color */}
      <Button
        variant={filters.colors.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1 relative"
        onClick={() => setActiveSection('color')}
      >
        <Palette className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Color</span>
        {filters.colors.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center">
            {filters.colors.length}
          </Badge>
        )}
      </Button>

      {/* Size */}
      <Button
        variant={filters.sizes.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1 relative"
        onClick={() => setActiveSection('size')}
      >
        <Ruler className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Size</span>
        {filters.sizes.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center">
            {filters.sizes.length}
          </Badge>
        )}
      </Button>

      {/* Material */}
      <Button
        variant={filters.materials.length > 0 ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1 relative"
        onClick={() => setActiveSection('material')}
      >
        <Layers className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Material</span>
        {filters.materials.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] flex items-center justify-center">
            {filters.materials.length}
          </Badge>
        )}
      </Button>

      {/* Price */}
      <Button
        variant={(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) ? 'default' : 'ghost'}
        size="sm"
        className="w-full h-10 flex flex-col items-center justify-center p-1 relative"
        onClick={() => setActiveSection('price')}
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-[8px] mt-0.5">Price</span>
      </Button>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-[8px] mt-2"
          onClick={clearFilters}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Filter section sheet */}
      <Sheet open={!!activeSection} onOpenChange={(open) => !open && setActiveSection(null)}>
        <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="capitalize">{activeSection?.replace('_', ' ')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {activeSection === 'category' && categories.map(cat => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={`mob-cat-${cat}`}
                  checked={filters.categories.includes(cat)}
                  onCheckedChange={() => toggleFilter('categories', cat)}
                />
                <Label htmlFor={`mob-cat-${cat}`} className="text-sm cursor-pointer">{cat}</Label>
              </div>
            ))}

            {activeSection === 'gender' && GENDERS.map(gender => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox
                  id={`mob-gender-${gender}`}
                  checked={filters.genders.includes(gender.toLowerCase())}
                  onCheckedChange={() => toggleFilter('genders', gender.toLowerCase())}
                />
                <Label htmlFor={`mob-gender-${gender}`} className="text-sm cursor-pointer">{gender}</Label>
              </div>
            ))}

            {activeSection === 'color' && (
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <Badge
                    key={color}
                    variant={filters.colors.includes(color) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm py-1 px-3"
                    onClick={() => toggleFilter('colors', color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            )}

            {activeSection === 'size' && (
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <Badge
                    key={size}
                    variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                    className="cursor-pointer text-sm py-1 px-3"
                    onClick={() => toggleFilter('sizes', size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            )}

            {activeSection === 'material' && materials.map(mat => (
              <div key={mat} className="flex items-center space-x-2">
                <Checkbox
                  id={`mob-mat-${mat}`}
                  checked={filters.materials.includes(mat)}
                  onCheckedChange={() => toggleFilter('materials', mat)}
                />
                <Label htmlFor={`mob-mat-${mat}`} className="text-sm cursor-pointer">{mat}</Label>
              </div>
            ))}

            {activeSection === 'price' && (
              <div className="space-y-4 px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                  max={maxPrice}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦{filters.priceRange[0].toLocaleString()}</span>
                  <span>₦{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 pt-4 bg-background">
            <Button className="w-full" onClick={() => setActiveSection(null)}>
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['category', 'type']} className="w-full">
        {/* Categories */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={filters.categories.includes(cat)}
                    onCheckedChange={() => toggleFilter('categories', cat)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Product Types */}
        {productTypes.length > 0 && (
          <AccordionItem value="type">
            <AccordionTrigger className="text-sm font-medium">Type</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {productTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => toggleFilter('types', type)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">{type}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Gender */}
        <AccordionItem value="gender">
          <AccordionTrigger className="text-sm font-medium">Gender</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {GENDERS.map(gender => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={filters.genders.includes(gender.toLowerCase())}
                    onCheckedChange={() => toggleFilter('genders', gender.toLowerCase())}
                  />
                  <Label htmlFor={`gender-${gender}`} className="text-sm cursor-pointer">{gender}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colors */}
        {colors.length > 0 && (
          <AccordionItem value="color">
            <AccordionTrigger className="text-sm font-medium">Color</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <Badge
                    key={color}
                    variant={filters.colors.includes(color) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('colors', color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <AccordionItem value="size">
            <AccordionTrigger className="text-sm font-medium">Size</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <Badge
                    key={size}
                    variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('sizes', size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <AccordionItem value="material">
            <AccordionTrigger className="text-sm font-medium">Material</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {materials.map(mat => (
                  <div key={mat} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mat-${mat}`}
                      checked={filters.materials.includes(mat)}
                      onCheckedChange={() => toggleFilter('materials', mat)}
                    />
                    <Label htmlFor={`mat-${mat}`} className="text-sm cursor-pointer">{mat}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Thickness */}
        <AccordionItem value="thickness">
          <AccordionTrigger className="text-sm font-medium">Thickness</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {THICKNESS_OPTIONS.map(t => (
                <div key={t} className="flex items-center space-x-2">
                  <Checkbox
                    id={`thick-${t}`}
                    checked={filters.thickness.includes(t)}
                    onCheckedChange={() => toggleFilter('thickness', t)}
                  />
                  <Label htmlFor={`thick-${t}`} className="text-sm cursor-pointer">{t}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-1">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
                max={maxPrice}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₦{filters.priceRange[0].toLocaleString()}</span>
                <span>₦{filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  // Active filters display
  const ActiveFilters = () => {
    const allActive = [
      ...filters.categories.map(c => ({ type: 'categories', value: c })),
      ...filters.types.map(t => ({ type: 'types', value: t })),
      ...filters.genders.map(g => ({ type: 'genders', value: g })),
      ...filters.colors.map(c => ({ type: 'colors', value: c })),
      ...filters.sizes.map(s => ({ type: 'sizes', value: s })),
      ...filters.materials.map(m => ({ type: 'materials', value: m })),
      ...filters.thickness.map(t => ({ type: 'thickness', value: t })),
    ];

    if (allActive.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {allActive.map(({ type, value }) => (
          <Badge key={`${type}-${value}`} variant="secondary" className="gap-1">
            {value}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => toggleFilter(type as keyof typeof filters, value)}
            />
          </Badge>
        ))}
      </div>
    );
  };

  // Mobile compact sidebar view
  if (isMobile) {
    return <MobileCompactFilters />;
  }

  return (
    <div className="space-y-4">
      <ActiveFilters />
      <FilterContent />
    </div>
  );
};
