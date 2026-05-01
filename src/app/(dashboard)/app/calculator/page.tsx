import { CalculatorForm } from "@/components/app/calculator-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalculatorPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace calculator</CardTitle>
          <CardDescription>
            Use the modular fee engine to estimate profitability on eBay, StockX, GOAT, and Facebook Marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <CalculatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
