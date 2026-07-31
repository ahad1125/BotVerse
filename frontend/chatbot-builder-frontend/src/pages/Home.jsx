import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/theme-toggle";
import { CustomCursor } from "@/custom-cursor";
import {
  FileText,
  Link2,
  Play,
  MessageSquareText,
  Globe2,
  BarChart3,
  Users,
  Code2,
  QrCode,
  Link as LinkIcon,
} from "lucide-react";
import logo from "../assets/logo.png";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: "-80px" },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomCursor />

      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="BotVerse Logo"
            className="h-6 w-6 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight">BotVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button onClick={() => navigate("/register")}>Get started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Badge variant="secondary" className="mb-6 font-normal">
            Built for clinics, academies, and real estate agencies in Pakistan
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
          className="text-5xl font-semibold tracking-tight sm:text-6xl"
        >
          Turn your docs into a chatbot
          <br />
          your customers can talk to.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Upload a PDF, Word doc, or spreadsheet, paste a URL, or drop a YouTube
          link. Your bot answers in English or Urdu, live on your site in
          minutes — no code required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-10"
        >
          <Button size="lg" onClick={() => navigate("/register")}>
            Start building — it's free
          </Button>
        </motion.div>
      </section>

      {/* Hero visual: mock chat */}
      <motion.section
        {...fadeUp(0.05)}
        className="mx-auto max-w-2xl px-6 pb-20"
      >
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 text-xs text-muted-foreground">
            Al Shifa Clinic — assistant
          </div>
          <div className="mb-2 flex">
            <div className="max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm">
              Do you have appointments on Sunday?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              Yes — Sundays 10am to 2pm. Want me to note your name for a slot?
            </div>
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <motion.div {...fadeUp()} className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three steps from raw documents to a bot answering your customers.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: FileText,
              step: "01",
              title: "Feed it your knowledge",
              body: "Upload PDFs, Word docs, spreadsheets, plain text, a URL, or a YouTube link. BotVerse indexes it automatically.",
            },
            {
              icon: MessageSquareText,
              step: "02",
              title: "Shape the personality",
              body: "Set the tone, greeting, and quick replies. Test it live in the playground before anyone else sees it.",
            },
            {
              icon: Code2,
              step: "03",
              title: "Deploy anywhere",
              body: "Drop in a script tag, share a hosted link, or print a QR code. Your bot is live in minutes.",
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <motion.div key={step} variants={staggerItem} className="relative">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {step}
              </div>
              <h3 className="mb-2 font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div {...fadeUp()} className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything your bot needs to actually help
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not a generic wrapper around an API — built for how real
              businesses answer questions.
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Globe2,
                title: "Urdu and English",
                body: "Customers ask in whichever language they're comfortable with. The bot answers in kind.",
              },
              {
                icon: MessageSquareText,
                title: "Confidence-based fallback",
                body: "When the bot isn't sure, it says so and hands off — instead of confidently making things up.",
              },
              {
                icon: Users,
                title: "Lead capture",
                body: "Collect name, phone, and email mid-conversation. Export as CSV whenever you need it.",
              },
              {
                icon: BarChart3,
                title: "Conversation analytics",
                body: "Peak hours, top questions, and what the bot couldn't answer — so you know what to fix.",
              },
              {
                icon: Link2,
                title: "Multiple knowledge sources",
                body: "Combine PDFs, Word documents, CSVs, scraped pages, and video transcripts into one bot's memory.",
              },
              {
                icon: Play,
                title: "YouTube transcripts",
                body: "Already explained something on video? Point BotVerse at it and skip re-writing docs.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
              >
                <Icon className="mb-4 h-5 w-5 text-muted-foreground" />
                <h3 className="mb-2 font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deployment options */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <motion.div {...fadeUp()} className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Deploy however fits your site
          </h2>
          <p className="mt-3 text-muted-foreground">
            No developer required, but developers are welcome.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Code2,
              title: "Script tag",
              body: "One line of code. Paste it before </body> and the widget appears on your site.",
            },
            {
              icon: LinkIcon,
              title: "Hosted link",
              body: "Get a standalone page for your bot — share it directly, no website required.",
            },
            {
              icon: QrCode,
              title: "QR code",
              body: "Print it on a menu, a clinic counter, or a storefront. Customers scan and start chatting.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="rounded-xl border bg-card p-6 text-center transition-colors hover:bg-muted/50"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div {...fadeUp()} className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Frequently asked
            </h2>
          </motion.div>

          <motion.div {...fadeUp(0.05)}>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Do I need to know how to code?
                </AccordionTrigger>
                <AccordionContent>
                  No. Uploading documents, training the bot, and deploying via
                  script tag or hosted link all happen through the dashboard.
                  The script tag is copy-paste — no editing required.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  What happens if the bot doesn't know an answer?
                </AccordionTrigger>
                <AccordionContent>
                  BotVerse scores its own confidence on every reply. Below a
                  threshold, it tells the customer it isn't sure instead of
                  guessing, and logs the question so you can see what's missing
                  from your knowledge base.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can it handle Urdu?</AccordionTrigger>
                <AccordionContent>
                  Yes. Customers can ask in Urdu or English, and the bot replies
                  in whichever language the question was asked in.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  What file types can I upload?
                </AccordionTrigger>
                <AccordionContent>
                  PDFs, Word documents, CSVs, plain text, web pages, and YouTube
                  video transcripts — combine as many as you need for one bot.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>How many bots can I create?</AccordionTrigger>
                <AccordionContent>
                  You can run multiple bots on one account — useful if you
                  manage more than one location or business.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t py-20">
        <motion.div
          {...fadeUp()}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight">
            Your customers have questions. Let your docs answer them.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Set up your first bot in the time it takes to make chai.
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => navigate("/register")}
          >
            Start building — it's free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} BotVerse</span>
          <div className="flex gap-6">
            <span>Created by a.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
