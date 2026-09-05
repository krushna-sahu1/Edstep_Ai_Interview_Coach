import { NextRequest, NextResponse } from 'next/server';
import { parsePdfBuffer } from '@/lib/pdf';
import { extractGitHubUsername, fetchGitHubProjects } from '@/lib/github';
import { JobContextBundle } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const githubUrl = (formData.get('github_url') as string | null) || '';

    let resumeText: string | null = null;
    let githubUsername: string | null = null;
    let githubProjects = null;

    // 1. Process Resume PDF if provided
    if (resumeFile && resumeFile.size > 0) {
      if (!resumeFile.type.includes('pdf') && !resumeFile.name.endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a PDF file.' },
          { status: 400 }
        );
      }
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      resumeText = await parsePdfBuffer(buffer);
    }

    // 2. Process GitHub profile if provided
    if (githubUrl.trim()) {
      githubUsername = extractGitHubUsername(githubUrl);
      if (!githubUsername) {
        return NextResponse.json(
          { error: 'Invalid GitHub profile URL or username.' },
          { status: 400 }
        );
      }

      try {
        githubProjects = await fetchGitHubProjects(githubUsername);
      } catch (err: any) {
        console.warn('GitHub fetch warning:', err.message);
        // If resume was also provided, don't fail completely — just attach warning
        if (!resumeText) {
          return NextResponse.json(
            { error: `GitHub error: ${err.message}` },
            { status: 400 }
          );
        }
      }
    }

    // 3. Strict Gating Rule: At least one input is required for Job Mode
    if (!resumeText && (!githubProjects || githubProjects.length === 0)) {
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
    console.error('Job prepare error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while preparing context bundle.' },
      { status: 500 }
    );
  }
}
