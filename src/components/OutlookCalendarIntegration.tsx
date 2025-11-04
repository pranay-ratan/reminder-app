import { useState } from "react";
import { toast } from "sonner";

interface CalendarIntegrationProps {
  isHorrorMode: boolean;
}

type CalendarType = 'google' | 'outlook';

export function OutlookCalendarIntegration({ isHorrorMode }: CalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Check if Outlook client ID is configured
  const hasOutlookClientId = !!import.meta.env.VITE_OUTLOOK_CLIENT_ID;

  const handleConnect = async () => {
    setIsLoading(true);

    if (!hasOutlookClientId) {
      toast.error('Outlook Client ID not configured. Check your .env.local file.');
      setIsLoading(false);
      return;
    }

    try {
      // Outlook OAuth scopes for Calendar access
      const scopes = [
        'https://graph.microsoft.com/Calendars.ReadWrite',
        'offline_access'
      ].join(' ');

      // Generate Outlook OAuth URL
      const outlookAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      outlookAuthUrl.searchParams.set('client_id', import.meta.env.VITE_OUTLOOK_CLIENT_ID);
      outlookAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/outlook/callback`);
      outlookAuthUrl.searchParams.set('response_type', 'code');
      outlookAuthUrl.searchParams.set('scope', scopes);
      outlookAuthUrl.searchParams.set('response_mode', 'query');

      const authUrl = outlookAuthUrl.toString();

      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'outlook-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'OUTLOOK_OAUTH_SUCCESS') {
          setIsConnected(true);
          setIsLoading(false);
          toast.success(isHorrorMode ? '🦇 Connected to enchanted calendar!' : '📅 Connected to Outlook Calendar!', {
            description: isHorrorMode ? "Your tasks will now haunt your calendar too!" : "Your reminders will sync automatically! ✨"
          });
          window.removeEventListener('message', handleMessage);
          popup.close();
        } else if (event.data.type === 'OUTLOOK_OAUTH_ERROR') {
          setIsLoading(false);
          toast.error('Failed to connect to Outlook Calendar');
          window.removeEventListener('message', handleMessage);
          popup.close();
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup is closed without completing OAuth
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          if (isLoading) {
            setIsLoading(false);
            window.removeEventListener('message', handleMessage);
          }
        }
      }, 1000);

    } catch (error) {
      console.error('OAuth error:', error);
      setIsLoading(false);
      toast.error('Failed to start Outlook OAuth');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.success(isHorrorMode ? '👻 Disconnected from enchanted calendar spirits' : '📅 Disconnected from Outlook Calendar');
  };

  const handleSetupGuide = () => {
    setShowSetup(!showSetup);
  };

  return (
    <div className="space-y-4">
      {/* Outlook Calendar */}
      <div className={`p-4 rounded-xl transition-all duration-300 ${
        isHorrorMode
          ? 'bg-indigo-800/50 border border-blue-600/50'
          : 'bg-white/70 border border-blue-200'
      } backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isHorrorMode ? '📿' : '📅'}</span>
            <div>
              <h3 className={`font-semibold ${isHorrorMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {isHorrorMode ? 'Enchanted Calendar' : 'Outlook Calendar'}
              </h3>
              <p className={`text-sm ${isHorrorMode ? 'text-indigo-300' : 'text-blue-600'}`}>
                {isConnected
                  ? (isHorrorMode ? 'Connected to the enchanted realms ✨' : 'Connected - Tasks sync automatically!')
                  : (isHorrorMode ? 'Connect to sync with the enchanted realms' : 'Connect to sync your reminders')
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isConnected
                  ? (isHorrorMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-500 hover:bg-red-400 text-white')
                  : (isHorrorMode
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-400 text-white')
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {isHorrorMode ? 'Connecting...' : 'Connecting...'}
                </span>
              ) : isConnected ? (
                <span className="flex items-center gap-2">
                  <span>🔌</span>
                  {isHorrorMode ? 'Disconnect' : 'Disconnect'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🔗</span>
                  {isHorrorMode ? 'Connect' : 'Connect'}
                </span>
              )}
            </button>
          </div>
        </div>

        {isConnected && (
          <div className={`mt-4 p-3 rounded-lg ${
            isHorrorMode ? 'bg-indigo-900/50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <span className={isHorrorMode ? 'text-indigo-200' : 'text-blue-700'}>
                {isHorrorMode ? 'Tasks will appear in your enchanted calendar' : 'Tasks will appear in your Outlook Calendar'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Setup Guide */}
      {!isConnected && (
        <div className="flex justify-center">
          <button
            onClick={handleSetupGuide}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
              isHorrorMode
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-500 hover:bg-gray-400 text-white'
            }`}
          >
            <span className="text-sm">? Setup Guide</span>
          </button>
        </div>
      )}

      {showSetup && (
        <div className={`mt-4 p-4 rounded-lg ${
          isHorrorMode ? 'bg-red-900/30' : 'bg-blue-50/30 backdrop-blur-sm'
        }`}>
          <h4 className={`font-semibold mb-3 ${isHorrorMode ? 'text-red-200' : 'text-blue-700'}`}>
            🚀 Outlook Calendar Setup Guide
          </h4>

          <div className="space-y-4">
            <div>
              <h5 className={`font-medium mb-2 ${isHorrorMode ? 'text-blue-300' : 'text-blue-600'}`}>
                📿 Outlook Calendar Setup:
              </h5>
              <div className="text-sm space-y-1 ml-4">
                <p className={isHorrorMode ? 'text-indigo-300' : 'text-blue-500'}>
                  1. Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="underline">Azure Portal</a>
                </p>
                <p className={isHorrorMode ? 'text-indigo-300' : 'text-blue-500'}>
                  2. Register an app and enable Microsoft Graph Calendar permissions
                </p>
                <p className={isHorrorMode ? 'text-indigo-300' : 'text-blue-500'}>
                  3. Add Client ID to <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">VITE_OUTLOOK_CLIENT_ID</code> in your .env.local file
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
