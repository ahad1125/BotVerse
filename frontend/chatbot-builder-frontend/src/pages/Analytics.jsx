import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useBot from "./../hooks/useBot";
import useAnalyticsSummary from "../hooks/useAnalyticsSummary";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquareText,
  AlertCircle,
  Users,
  Zap,
  TrendingUp,
  BarChart3,
  MessageSquareWarning,
  List
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--foreground)",
  fontSize: "12px",
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const CHART_COLOR = "var(--primary)";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});

function MetricCard({
  icon: Icon,
  label,
  value,
  valueClassName = "",
  delay = 0,
}) {
  return (
    <motion.div {...fadeUp(delay)}>
      <Card className="shadow-xs hover:shadow-sm transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {label}
          </div>
          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${valueClassName}`}
          >
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: bot } = useBot(id);
  const { data: summary, isLoading, isError } = useAnalyticsSummary(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="mx-auto mt-20 max-w-lg rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          Failed to load analytics summary. Please check your connection.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/bots/${id}`)}>
          Go Back
        </Button>
      </div>
    );
  }

  const data = summary;
  const conversationsPerDay = data.conversations_per_day || [];
  const peakHours = data.peak_hours || [];
  const topQuestions = data.top_questions || [];

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const formatHour = (hourInt) => {
    const ampm = hourInt >= 12 ? "PM" : "AM";
    const formattedHour = hourInt % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex items-center justify-between border-b pb-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/bots/${id}`)}
            className="mb-2 -ml-2 gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bot
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {bot?.name}{" "}
            <span className="font-normal text-muted-foreground text-lg">
              / Performance Analytics
            </span>
          </h1>
        </div>
      </motion.div>

      {/* Metric row — 4 across, small */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          icon={MessageSquareText}
          label="Conversations"
          value={data.total_conversations ?? "—"}
          delay={0.02}
        />
        <MetricCard
          icon={AlertCircle}
          label="Unanswered Queries"
          value={data.unanswered_count ?? "—"}
          valueClassName="text-amber-500"
          delay={0.04}
        />
        <MetricCard
          icon={Users}
          label="Leads Captured"
          value={data.leads_count ?? "—"}
          delay={0.06}
        />
        <MetricCard
          icon={Zap}
          label="Resolution Rate"
          value={data.answer_rate !== undefined ? `${data.answer_rate}%` : "—"}
          valueClassName="text-emerald-500"
          delay={0.08}
        />
      </div>

      {/* Two detailed charts side by side */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Conversations per Day */}
        <motion.div {...fadeUp(0.1)}>
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                Conversations Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {conversationsPerDay.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-xs text-muted-foreground italic">
                  No conversation history recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={conversationsPerDay}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      dy={10}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      allowDecimals={false}
                      dx={-5}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={formatDate}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLOR}
                      strokeWidth={2.5}
                      dot={{ r: 4, stroke: "var(--background)", strokeWidth: 1.5, fill: CHART_COLOR }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Peak Hours */}
        <motion.div {...fadeUp(0.12)}>
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                Hourly Traffic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {peakHours.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-xs text-muted-foreground italic">
                  No hourly stats available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={peakHours}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={formatHour}
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      dy={10}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      allowDecimals={false}
                      dx={-5}
                    />
                    <Tooltip
                      labelFormatter={(h) => `Time: ${formatHour(h)}`}
                      contentStyle={chartTooltipStyle}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLOR}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top questions + unanswered side by side */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Top Questions */}
        <motion.div {...fadeUp(0.16)}>
          <Card className="shadow-xs h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <List className="h-4 w-4 text-primary" />
                Frequently Asked Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topQuestions.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No topics identified yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {topQuestions.slice(0, 5).map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
                    >
                      <span className="truncate font-medium text-foreground pr-2">
                        {q.representative_question}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 font-semibold px-2.5 py-0.5 rounded-full border"
                      >
                        {q.count} queries
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Unanswered Questions */}
        <motion.div {...fadeUp(0.18)}>
          <Card className="shadow-xs h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <MessageSquareWarning className="h-4 w-4 text-amber-500" />
                Unresolved Questions (Recent)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!data.unanswered_questions || data.unanswered_questions.length === 0) ? (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  No unanswered queries found. All questions resolved successfully!
                </div>
              ) : (
                <div className="space-y-2">
                  {data.unanswered_questions.slice(0, 5).map((q, i) => (
                    <div
                      key={q.id || i}
                      className="rounded-lg border bg-amber-50/10 dark:bg-amber-950/10 border-amber-500/20 px-4 py-3 text-sm flex items-start justify-between"
                    >
                      <span className="font-medium text-foreground leading-relaxed pr-2">
                        "{q.question || q.representative_question || q}"
                      </span>
                      {q.created_at && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">
                          {new Date(q.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;
