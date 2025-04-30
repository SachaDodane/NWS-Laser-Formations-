import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import User from '@/models/User';
import PDFDocument from 'pdfkit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { courseId, courseTitle, userName } = await request.json();

    if (!courseId || !courseTitle || !userName) {
      return NextResponse.json(
        { message: 'Informations incomplètes pour générer le certificat.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a complété le cours à 100%
    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (!progress || progress.completionPercentage < 100) {
      return NextResponse.json(
        { message: "Vous devez compléter 100% de la formation pour obtenir votre certificat." },
        { status: 400 }
      );
    }

    // Générer le certificat PDF
    const pdfBuffer = await generateCertificatePDF({
      courseTitle,
      userName,
      completionDate: progress.completedAt ? new Date(progress.completedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
    });

    // Renvoyer le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificat_${courseTitle.replace(/\s+/g, '_').toLowerCase()}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du certificat:', error);
    return NextResponse.json(
      { message: error.message || "Une erreur est survenue lors de la génération du certificat." },
      { status: 500 }
    );
  }
}

interface CertificateData {
  courseTitle: string;
  userName: string;
  completionDate: string;
}

async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Créer un nouveau document PDF
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50,
        info: {
          Title: `Certificat de réussite - ${data.courseTitle}`,
          Author: 'NWS Laser Formations'
        }
      });

      // Collecter les chunks dans un tampon
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Ajouter une bordure décorative
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .stroke('#3b82f6');

      // Ajouter une bordure intérieure
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70)
        .lineWidth(1)
        .stroke('#3b82f6');

      // Ajouter un fond léger
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70)
        .fill('#f0f9ff');

      // Logo et en-tête
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1e3a8a')
        .text('CERTIFICAT DE RÉUSSITE', 0, 90, { align: 'center' });

      // Ligne décorative
      doc.moveTo(150, 125)
        .lineTo(doc.page.width - 150, 125)
        .lineWidth(2)
        .stroke('#3b82f6');

      // Le corps du certificat
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text('Ce certificat atteste que', 0, 160, { align: 'center' });

      // Nom de la personne
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(data.userName, 0, 200, { align: 'center' });

      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text('a complété avec succès la formation', 0, 250, { align: 'center' });

      // Titre du cours
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#1e3a8a')
        .text(data.courseTitle, 0, 290, { align: 'center' });

      // Date
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#1f2937')
        .text(`Délivré le ${data.completionDate}`, 0, 340, { align: 'center' });

      // Signature
      doc.fontSize(14)
        .fillColor('#1f2937')
        .text('NWS Laser Formations', 0, 420, { align: 'center' });

      // Ligne pour signature
      doc.moveTo(250, 410)
        .lineTo(doc.page.width - 250, 410)
        .lineWidth(1)
        .stroke('#3b82f6');

      // Note de bas de page
      doc.fontSize(10)
        .fillColor('#64748b')
        .text('Ce certificat confirme l\'achèvement réussi de tous les modules de la formation.', 0, 490, { align: 'center' });

      // Finir le document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
