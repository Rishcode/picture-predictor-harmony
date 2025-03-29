
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Recycle, UploadCloud, BarChart2, Camera } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">WasteDetect</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
          <div className="container flex flex-col items-center text-center space-y-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Recycle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              AI-Powered Waste Detection
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Upload or capture images of waste and let our AI identify and analyze the contents
              to help you make better recycling decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our waste detection platform makes it easy to analyze and understand waste composition
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Images</h3>
                <p className="text-muted-foreground">
                  Upload waste images from your device or capture them directly using your camera
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Recycle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                <p className="text-muted-foreground">
                  Our YOLO model analyzes your images to identify and categorize different types of waste
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BarChart2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Detailed Results</h3>
                <p className="text-muted-foreground">
                  View comprehensive analysis of detected waste types, quantities, and percentages
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Ready to analyze your waste?</h2>
              <p className="text-lg text-muted-foreground">
                Join WasteDetect today and start making more informed recycling decisions with our
                AI-powered waste detection technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Create Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 bg-background rounded-lg p-6 shadow-sm">
              <div className="aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                <Camera className="h-20 w-20 text-muted-foreground animate-pulse-opacity" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">WasteDetect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered waste detection and analysis platform.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">API</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Guides</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="container mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2023 WasteDetect. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
