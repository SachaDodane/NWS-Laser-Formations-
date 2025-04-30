import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';

// In a real application, we would use @react-pdf/renderer to generate PDFs
// For this demo, we'll simulate PDF generation with HTML

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Parse certificate ID to extract user and course IDs
    // Expected format: userId-courseId-timestamp
    const parts = params.certificateId.split('-');
    if (parts.length < 2) {
      return NextResponse.json(
        { message: 'ID de certificat invalide' },
        { status: 400 }
      );
    }
    
    const userId = parts[0];
    const courseId = parts[1];
    
    // Check if the requesting user is the owner of the certificate or an admin
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Non autorisé à accéder à ce certificat' },
        { status: 403 }
      );
    }
    
    // Get user, course, and progress data
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    const progress = await Progress.findOne({ userId, courseId });
    
    if (!user || !course || !progress || !progress.certificate) {
      return NextResponse.json(
        { message: 'Certificat non trouvé' },
        { status: 404 }
      );
    }
    
    // In a real application, we would generate a PDF here
    // For this demo, we'll generate an HTML certificate that simulates a PDF
    
    const certificateDate = new Date(progress.certificate.issuedDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const certificateHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificat - ${course.title}</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f8fa;
          }
          .certificate {
            max-width: 800px;
            margin: 20px auto;
            padding: 40px;
            background-color: #fff;
            border: 20px solid #0080ff;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            position: relative;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo img {
            max-width: 250px;
          }
          .title {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #0080ff;
            margin-bottom: 20px;
            text-transform: uppercase;
          }
          .subtitle {
            text-align: center;
            font-size: 24px;
            color: #555;
            margin-bottom: 40px;
          }
          .content {
            text-align: center;
            font-size: 18px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 40px;
          }
          .name {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 30px;
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
          }
          .date, .signature {
            flex: 1;
            text-align: center;
          }
          .label {
            font-size: 14px;
            color: #777;
            margin-bottom: 5px;
          }
          .value {
            font-size: 16px;
            color: #333;
            border-top: 1px solid #ccc;
            padding-top: 5px;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            pointer-events: none;
            font-size: 180px;
            color: #0080ff;
            z-index: 0;
          }
          .certificate-id {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="watermark">CERTIFIÉ</div>
          
          <div class="logo">
            <img src="https://nws-tech.fr/wp-content/uploads/2023/06/nws_laser_tr.png" alt="NWS Laser Formations">
          </div>
          
          <div class="title">Certificat d'accomplissement</div>
          <div class="subtitle">Formation Laser Professionnelle</div>
          
          <div class="content">
            Ce certificat atteste que
          </div>
          
          <div class="name">${user.name || user.email}</div>
          
          <div class="content">
            a complété avec succès la formation<br>
            <strong>"${course.title}"</strong><br>
            avec les compétences et connaissances requises.
          </div>
          
          <div class="details">
            <div class="date">
              <div class="label">Date de délivrance</div>
              <div class="value">${certificateDate}</div>
            </div>
            <div class="signature">
              <div class="label">Signature</div>
              <div class="value">NWS Laser Formations</div>
            </div>
          </div>
          
          <div class="certificate-id">
            Certificat ID: ${params.certificateId}
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Return HTML content with appropriate headers
    return new NextResponse(certificateHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { message: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
