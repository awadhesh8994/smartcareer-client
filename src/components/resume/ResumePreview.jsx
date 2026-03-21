import { format } from 'date-fns'

const fmt = (dateStr) => {
  if (!dateStr) return ''
  try { return format(new Date(dateStr), 'MMM yyyy') }
  catch { return dateStr }
}

const Section = ({ title, children }) => (
  <div className="mb-5">
    <div className="flex items-center gap-3 mb-2">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">{title}</h2>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
    {children}
  </div>
)

export default function ResumePreview({ resume }) {
  if (!resume) return null
  const p = resume.personalInfo || {}
  const hasExperience    = resume.experience?.some(e => e.role || e.company)
  const hasEducation     = resume.education?.some(e => e.institution || e.degree)
  const hasProjects      = resume.projects?.some(e => e.name)
  const hasCerts         = resume.certifications?.some(e => e.name)
  const hasSkills        = Object.values(resume.skills || {}).some(arr => arr?.length > 0)

  return (
    <div
      id="resume-preview"
      className="bg-white text-gray-900 font-sans p-10 min-h-[1056px] w-[816px] mx-auto"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '11px', lineHeight: '1.5' }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="text-center mb-5 pb-4 border-b-2 border-gray-800">
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Arial, sans-serif' }}>
          {p.name || 'Your Name'}
        </h1>
        <div className="flex items-center justify-center flex-wrap gap-2 mt-2" style={{ fontSize: '10px', color: '#555', fontFamily: 'Arial, sans-serif' }}>
          {p.email    && <span>{p.email}</span>}
          {p.email    && (p.phone || p.location) && <span>|</span>}
          {p.phone    && <span>{p.phone}</span>}
          {p.phone    && p.location && <span>|</span>}
          {p.location && <span>{p.location}</span>}
          {p.location && (p.linkedin || p.github) && <span>|</span>}
          {p.linkedin && <span>{p.linkedin.replace('https://', '').replace('http://', '')}</span>}
          {p.linkedin && p.github && <span>|</span>}
          {p.github   && <span>{p.github.replace('https://', '').replace('http://', '')}</span>}
          {p.portfolio && <><span>|</span><span>{p.portfolio.replace('https://', '').replace('http://', '')}</span></>}
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────────────── */}
      {p.summary && (
        <Section title="Professional Summary">
          <p style={{ fontSize: '11px', color: '#333', textAlign: 'justify' }}>{p.summary}</p>
        </Section>
      )}

      {/* ── Experience ─────────────────────────────────────────── */}
      {hasExperience && (
        <Section title="Work Experience">
          {resume.experience.filter(e => e.role || e.company).map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>{exp.role}</p>
                  <p style={{ fontSize: '11px', color: '#444', fontStyle: 'italic' }}>
                    {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    {exp.type ? ` · ${exp.type}` : ''}
                  </p>
                </div>
                <p style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
                  {fmt(exp.startDate)}{exp.startDate ? ' – ' : ''}{exp.isCurrently ? 'Present' : fmt(exp.endDate)}
                </p>
              </div>
              {exp.bullets?.filter(b => b.trim()).length > 0 && (
                <ul style={{ marginTop: '4px', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {exp.bullets.filter(b => b.trim()).map((b, bi) => (
                    <li key={bi} style={{ fontSize: '11px', color: '#333', marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Projects ───────────────────────────────────────────── */}
      {hasProjects && (
        <Section title="Projects">
          {resume.projects.filter(p => p.name).map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-start justify-between">
                <p style={{ fontWeight: 'bold', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                  {proj.name}
                  {proj.techStack?.length > 0 && (
                    <span style={{ fontWeight: 'normal', fontSize: '10px', color: '#666' }}> | {proj.techStack.join(', ')}</span>
                  )}
                </p>
                <div style={{ fontSize: '10px', color: '#0066cc' }}>
                  {proj.liveLink && <span>{proj.liveLink.replace('https://', '')}</span>}
                  {proj.liveLink && proj.githubLink && <span> | </span>}
                  {proj.githubLink && <span>{proj.githubLink.replace('https://github.com/', 'github.com/')}</span>}
                </div>
              </div>
              {proj.description && <p style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{proj.description}</p>}
              {proj.bullets?.filter(b => b.trim()).length > 0 && (
                <ul style={{ marginTop: '3px', paddingLeft: '16px', listStyleType: 'disc' }}>
                  {proj.bullets.filter(b => b.trim()).map((b, bi) => (
                    <li key={bi} style={{ fontSize: '11px', color: '#333' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ── Education ──────────────────────────────────────────── */}
      {hasEducation && (
        <Section title="Education">
          {resume.education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </p>
                  <p style={{ fontSize: '11px', color: '#444', fontStyle: 'italic' }}>{edu.institution}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', color: '#666', fontFamily: 'Arial, sans-serif' }}>
                    {edu.startYear && edu.endYear ? `${new Date(edu.startYear).getFullYear()} – ${new Date(edu.endYear).getFullYear()}` :
                     edu.endYear ? new Date(edu.endYear).getFullYear() : ''}
                  </p>
                  {edu.cgpa && <p style={{ fontSize: '10px', color: '#666' }}>GPA: {edu.cgpa}</p>}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Skills ─────────────────────────────────────────────── */}
      {hasSkills && (
        <Section title="Skills">
          <div style={{ display: 'grid', gap: '3px' }}>
            {resume.skills?.technical?.length > 0 && (
              <p style={{ fontSize: '11px' }}>
                <strong style={{ fontFamily: 'Arial, sans-serif' }}>Technical: </strong>
                {resume.skills.technical.join(' · ')}
              </p>
            )}
            {resume.skills?.tools?.length > 0 && (
              <p style={{ fontSize: '11px' }}>
                <strong style={{ fontFamily: 'Arial, sans-serif' }}>Tools: </strong>
                {resume.skills.tools.join(' · ')}
              </p>
            )}
            {resume.skills?.soft?.length > 0 && (
              <p style={{ fontSize: '11px' }}>
                <strong style={{ fontFamily: 'Arial, sans-serif' }}>Soft Skills: </strong>
                {resume.skills.soft.join(' · ')}
              </p>
            )}
            {resume.skills?.languages?.length > 0 && (
              <p style={{ fontSize: '11px' }}>
                <strong style={{ fontFamily: 'Arial, sans-serif' }}>Languages: </strong>
                {resume.skills.languages.join(' · ')}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* ── Certifications ─────────────────────────────────────── */}
      {hasCerts && (
        <Section title="Certifications">
          {resume.certifications.filter(c => c.name).map((cert, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>{cert.name}</p>
                {cert.issuer && <p style={{ fontSize: '10px', color: '#555' }}>{cert.issuer}</p>}
              </div>
              {cert.date && <p style={{ fontSize: '10px', color: '#666' }}>{fmt(cert.date)}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}