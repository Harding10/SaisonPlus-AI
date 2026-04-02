
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface MarketPrice {
  id: string;
  marketName: string;
  cropName: string;
  pricePerUnit: number;
  unit: string;
  recordingTimestamp: string;
}

export function MarketPriceList({ prices }: { prices: any[] }) {
  if (!prices || prices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
        Aucune donnée de prix disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Marché</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="text-right">Prix (FCFA)</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead className="text-right">Tendance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price) => (
            <TableRow key={price.id}>
              <TableCell className="font-medium">{price.marketName}</TableCell>
              <TableCell className="capitalize">{price.cropName}</TableCell>
              <TableCell className="text-right font-semibold">
                {(price.pricePerUnit || 0).toLocaleString()}
              </TableCell>
              <TableCell>{price.unit}</TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center gap-1">
                  {price.pricePerUnit > 500 ? (
                    <TrendingUp className="w-4 h-4 text-destructive" />
                  ) : price.pricePerUnit < 300 ? (
                    <TrendingDown className="w-4 h-4 text-primary" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
