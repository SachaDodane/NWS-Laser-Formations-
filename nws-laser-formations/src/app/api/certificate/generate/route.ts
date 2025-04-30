import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/connect';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';
import * as puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const { courseId, courseTitle, userName, completionDate } = await request.json();

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
      completionDate: completionDate || (progress.completedAt ? new Date(progress.completedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')),
    });

    // Enregistrer le certificat dans le dossier public pour le téléchargement
    const sanitizedTitle = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `certificat_${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    
    // S'assurer que le répertoire existe
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    const filePath = path.join(certificatesDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Renvoyer le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
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
  // Utiliser un certificat statique
  const certificatePath = path.join(process.cwd(), 'public', 'images', 'certificates', 'certificate_template.html');
  let templateHtml = fs.readFileSync(certificatePath, 'utf8');
  
  // Remplacer les variables
  templateHtml = templateHtml
    .replace('{{USER_NAME}}', data.userName)
    .replace('{{COURSE_TITLE}}', data.courseTitle)
    .replace('{{COMPLETION_DATE}}', data.completionDate);
  
  // Créer un fichier HTML temporaire
  const tempHtmlPath = path.join(process.cwd(), 'public', 'certificates', 'temp_certificate.html');
  fs.writeFileSync(tempHtmlPath, templateHtml);
  
  try {
    // Lancer Puppeteer pour convertir HTML en PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Charger le HTML
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    
    // Générer le PDF
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    
    await browser.close();
    
    // Supprimer le fichier temporaire
    fs.unlinkSync(tempHtmlPath);
    
    return pdf;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Erreur lors de la génération du certificat');
  }
}
