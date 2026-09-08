import { NextRequest, NextResponse } from 'next/server';
import { parsePdfBuffer } from '@/lib/pdf';
import { extractGitHubUsername, fetchGitHubProjects } from '@/lib/github';
import { JobContextBundle } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (formErr: any) {
      return NextResponse.json(
        { error: 'Invalid form submission. Please provide a valid PDF or GitHub profile.' },
        { status: 400 }
      );
    }

    const resumeFile = formData.get('resume') as File | null;
    const githubUrl = (formData.get('github_url') as string | null) || '';

    let resumeText: string | null = null;
    let githubUsername: string | null = null;
    let githubProjects = null;
    let pdfParseError: string | null = null;
    let githubFetchError: string | null = null;

    // 1. Process Resume PDF if provided
    if (resumeFile && resumeFile.size > 0) {
      const isPdfType = resumeFile.type?.includes('pdf') || resumeFile.name?.toLowerCase().endsWith('.pdf');
      if (!isPdfType) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a PDF file (.pdf).' },
          { status: 400 }
        );
      }

      try {
        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        resumeText = await parsePdfBuffer(buffer);
      } catch (pdfErr: any) {
        console.warn('PDF parsing error in prepare route:', pdfErr?.message || pdfErr);
        pdfParseError = pdfErr?.message || 'Failed to extract text from the uploaded PDF.';
      }
    }

    // 2. Process GitHub profile if provided
    if (githubUrl.trim()) {
      githubUsername = extractGitHubUsername(githubUrl);
      if (!githubUsername) {
        return NextResponse.json(
          { error: 'Invalid GitHub profile URL or username format. Please enter a valid username or github.com link.' },
          { status: 400 }
        );
      }

      try {
        githubProjects = await fetchGitHubProjects(githubUsername);
      } catch (ghErr: any) {
        console.warn('GitHub fetch error in prepare route:', ghErr?.message || ghErr);
        githubFetchError = ghErr?.message || 'Unable to fetch GitHub repositories.';
      }
    }

    // 3. Strict Gating & Error Evaluation
    const hasValidResume = Boolean(resumeText && resumeText.trim().length > 0);
    const hasValidProjects = Boolean(githubProjects && githubProjects.length > 0);

    if (!hasValidResume && !hasValidProjects) {
      // If user uploaded a resume and it failed
      if (resumeFile && resumeFile.size > 0 && pdfParseError && !githubUrl.trim()) {
        return NextResponse.json(
          { error: `Resume parsing failed: ${pdfParseError} Please ensure the PDF has readable text.` },
          { status: 400 }
        );
      }

      // If user entered GitHub and it failed
      if (githubUrl.trim() && githubFetchError && (!resumeFile || resumeFile.size === 0)) {
        return NextResponse.json(
          { error: `GitHub profile error: ${githubFetchError}` },
          { status: 400 }
        );
      }

      // If both were attempted but both failed
      if (pdfParseError || githubFetchError) {
        return NextResponse.json(
          {
            error: `Failed to prepare profile: ${[pdfParseError, githubFetchError].filter(Boolean).join(' | ')}`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Please provide either a Resume (PDF) or a GitHub profile URL to personalize your interview.' },
        { status: 400 }
      );
    }

    const contextBundle: JobContextBundle = {
      mode: 'job',
      resume_text: resumeText,
      github_username: githubUsername,
      github_projects: githubProjects,
    };

    return NextResponse.json({
      success: true,
      context_bundle: contextBundle,
    });
  } catch (error: any) {
    console.error('Job prepare unhandled error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while preparing context bundle.' },
      { status: 500 }
    );
  }
}
