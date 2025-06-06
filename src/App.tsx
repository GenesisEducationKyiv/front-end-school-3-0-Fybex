import "./App.css";

import AppErrorBoundary from "@/components/error-boundary";
import MusicManager from "@/components/music-manager";
import AnimatedTitle from "@/components/ui/animated-title";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AppErrorBoundary
      description="Something went wrong with the application. This could be due to high API usage, network issues, or a server problem."
      title="Application Error"
    >
      <div className="min-h-screen p-8">
        <AnimatedTitle
          animatedSuffix={" music tracks manager"}
          baseTitle="sona."
          data-testid="tracks-header"
        />

        <AppErrorBoundary
          description="There was a problem with the application. This could be due to high API usage or connectivity issues."
          title="Music Manager Error"
        >
          <MusicManager />
        </AppErrorBoundary>

        <Toaster data-testid="toast-container" />
      </div>
    </AppErrorBoundary>
  );
}

export default App;
