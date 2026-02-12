import { useEffect, useState } from 'react';
import { useActor } from './hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Bot, Copy, CheckCircle2, ExternalLink, Settings, Code, MessageSquare } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const { actor, isFetching } = useActor();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (actor && !isFetching) {
      actor.getStaticAvatar('default').then((bytes) => {
        const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setAvatarUrl(url);
      });
    }
  }, [actor, isFetching]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const publicAvatarUrl = avatarUrl ? `${window.location.origin}/assets/generated/aiops-bot-avatar.dim_128x128.png` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AIOPS Bot</h1>
              <p className="text-sm text-muted-foreground">Google Chat Jira Integration Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Bot Avatar Section */}
          <Card className="overflow-hidden border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chart-1/10 to-chart-2/10">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-chart-1" />
                <CardTitle>Bot Avatar</CardTitle>
              </div>
              <CardDescription>Use this avatar image for your Google Chat bot configuration</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt="AIOPS Bot Avatar"
                        className="h-32 w-32 rounded-2xl border-4 border-chart-1/20 shadow-lg"
                      />
                      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-chart-2 shadow-md">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-dashed border-muted-foreground/20 bg-muted/50">
                      <Bot className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Public Avatar URL</h3>
                    <div className="flex gap-2">
                      <code className="flex-1 rounded-lg bg-muted px-4 py-3 text-xs break-all">
                        {publicAvatarUrl || 'Loading...'}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(publicAvatarUrl)}
                        disabled={!publicAvatarUrl}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Alert>
                    <AlertDescription className="text-xs">
                      Host this image publicly and use the URL in your Apps Script properties as{' '}
                      <code className="rounded bg-muted px-1 py-0.5">BOT_AVATAR_URL</code>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chart-3/10 to-chart-4/10">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-chart-3" />
                <CardTitle>Setup Instructions</CardTitle>
              </div>
              <CardDescription>Configure your Google Apps Script bot with these steps</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Badge className="mt-1 h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">1</Badge>
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold">Configure Script Properties</h4>
                      <p className="mb-3 text-sm text-muted-foreground">
                        In Google Apps Script, go to Project Settings → Script Properties and add:
                      </p>
                      <div className="space-y-2 rounded-lg bg-muted p-4 text-xs font-mono">
                        <div>
                          <span className="text-chart-1">JIRA_BASE_URL</span> = https://your-instance.atlassian.net
                        </div>
                        <div>
                          <span className="text-chart-1">JIRA_EMAIL</span> = your-email@company.com
                        </div>
                        <div>
                          <span className="text-chart-1">JIRA_API_TOKEN</span> = your-api-token
                        </div>
                        <div>
                          <span className="text-chart-1">JSM_PROJECT_KEY</span> = AIOP
                        </div>
                        <div>
                          <span className="text-chart-1">INCIDENT_ISSUE_TYPE_ID</span> = 10012
                        </div>
                        <div>
                          <span className="text-chart-1">BOT_AVATAR_URL</span> = {publicAvatarUrl || 'your-hosted-avatar-url'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-4">
                    <Badge className="mt-1 h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">2</Badge>
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold">Deploy the Apps Script</h4>
                      <p className="text-sm text-muted-foreground">
                        Copy the code.gs file content and deploy as a Google Chat app from the Apps Script editor.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-4">
                    <Badge className="mt-1 h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">3</Badge>
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold">Test Your Bot</h4>
                      <p className="text-sm text-muted-foreground">
                        Add the bot to a Google Chat space and try commands like "hi", "projects", "issues", or "create
                        incident".
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-chart-5/10 to-chart-1/10">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-chart-5" />
                <CardTitle>Bot Features</CardTitle>
              </div>
              <CardDescription>What the AIOPS bot can do for your team</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
                  <h4 className="font-semibold">📋 List Projects</h4>
                  <p className="text-sm text-muted-foreground">View all Jira Service Management projects</p>
                </div>
                <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
                  <h4 className="font-semibold">🚨 List Incidents</h4>
                  <p className="text-sm text-muted-foreground">See high and critical priority incidents</p>
                </div>
                <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
                  <h4 className="font-semibold">➕ Create Incidents</h4>
                  <p className="text-sm text-muted-foreground">Guided flow to create new incidents with status</p>
                </div>
                <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
                  <h4 className="font-semibold">💬 Q&A Support</h4>
                  <p className="text-sm text-muted-foreground">Ask questions about incidents and Jira</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Reference */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6" />
                <CardTitle>Code Reference</CardTitle>
              </div>
              <CardDescription>Access the complete Google Apps Script implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/code.gs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View code.gs Implementation
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/40 bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
