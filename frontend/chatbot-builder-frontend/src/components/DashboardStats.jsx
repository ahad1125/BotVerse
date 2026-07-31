import { motion } from "framer-motion";
import { Bot, CircleCheck, Globe2 } from "lucide-react";

function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-xl border bg-card p-5"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function DashboardStats({ bots }) {
  const total = bots.length;
  const active = bots.filter((b) => b.is_active).length;
  const urduBots = bots.filter((b) => b.language === "urdu").length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard icon={Bot} label="Total bots" value={total} delay={0} />
      <StatCard
        icon={CircleCheck}
        label="Active bots"
        value={active}
        delay={0.05}
      />
      <StatCard
        icon={Globe2}
        label="Urdu-enabled bots"
        value={urduBots}
        delay={0.1}
      />
    </div>
  );
}

export default DashboardStats;
