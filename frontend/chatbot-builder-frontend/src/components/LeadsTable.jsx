import { useLeads } from "@/hooks/useLeads";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "./ui/toast";
import { Download, Users } from "lucide-react";

function exportToCSV(leads) {
  try {
    const headers = ["Name", "Email", "Phone", "Captured"];
    const rows = leads.map((l) => [
      l.name || "",
      l.email || "",
      l.phone_number || "",
      new Date(l.created_at).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.add({
      title: "Export complete",
      description: `Successfully exported ${leads.length} lead${leads.length === 1 ? "" : "s"} to CSV.`,
      type: "success",
    });
  } catch (err) {
    toast.add({
      title: "Export failed",
      description: "Failed to export leads.",
      type: "error",
    });
  }
}

function LeadsTable({ botId }) {
  const { data, isLoading } = useLeads(botId);
  const leads = data?.results || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Customer Leads</h3>
            <p className="text-xs text-muted-foreground">
              Contact information collected during chatbot conversations.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => exportToCSV(leads)}
          disabled={!leads.length}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground italic">
          No leads captured yet. The bot collects contact info when customers book or purchase.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Captured Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {lead.name || (
                      <span className="text-muted-foreground/60 italic text-xs">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.email || (
                      <span className="text-muted-foreground/60 italic text-xs">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.phone_number || (
                      <span className="text-muted-foreground/60 italic text-xs">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(lead.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default LeadsTable;
