import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Briefcase, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { extractTextFromPdf } from '@/src/lib/pdfParser';
import { analyzeResume, AnalysisResult } from '@/src/services/geminiService';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting PDF extraction...');
      const resumeText = await extractTextFromPdf(resumeFile);
      console.log('PDF extraction successful, length:', resumeText.length);
      
      if (!resumeText.trim()) {
        throw new Error('Could not extract any text from the PDF. Please ensure it is not an image-only PDF.');
      }

      console.log('Starting AI analysis...');
      const analysis = await analyzeResume(resumeText, jobDescription);
      console.log('AI analysis successful');
      setResult(analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError('An unexpected error occurred during analysis. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            Resume <span className="text-blue-600">Match</span> Scorer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Optimize your application with AI-powered gap analysis and tailored cover letters.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Job Description
                </CardTitle>
                <CardDescription>Paste the full text of the job you're applying for.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Paste job description here..."
                  className="min-h-[300px] resize-none border-gray-100 focus:border-blue-300 focus:ring-blue-100 rounded-xl"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resume Upload
                </CardTitle>
                <CardDescription>Upload your resume in PDF format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <Input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label 
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 group-hover:bg-gray-100 group-hover:border-blue-300 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-blue-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF (MAX. 10MB)</p>
                    </div>
                  </label>
                </div>
                {resumeFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{resumeFile.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Match'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400">Analysis Results</h3>
                  <p className="text-gray-400 max-w-xs mt-2">
                    Upload your resume and paste a job description to see your match score and gap analysis.
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Analyzing Your Profile</h3>
                  <p className="text-muted-foreground mt-2 text-center">
                    Gemini is comparing your skills with the job requirements...
                  </p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Match Score</p>
                          <h2 className="text-6xl font-bold">{result.matchScore}%</h2>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-white/20 text-white border-none mb-2">
                            {result.matchScore >= 80 ? 'Excellent Match' : result.matchScore >= 60 ? 'Good Match' : 'Potential Match'}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={result.matchScore} className="h-2 mt-4 bg-blue-400/30" />
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 leading-relaxed italic">
                        "{result.summary}"
                      </p>
                    </CardContent>
                  </Card>

                  {/* Gaps Card */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Gap Analysis
                      </CardTitle>
                      <CardDescription>Key skills or requirements missing from your resume.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.gapAnalysis.map((gap, i) => (
                          <Badge key={i} variant="outline" className="px-3 py-1 border-amber-200 bg-amber-50 text-amber-700 rounded-lg">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cover Letter Card */}
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg">Tailored Cover Letter</CardTitle>
                        <CardDescription>A draft highlighting your relevant strengths.</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(result.coverLetter)}
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] w-full rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {result.coverLetter}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Powered by Google Gemini AI & PDF.js
          </p>
        </footer>
      </div>
    </div>
  );
}
