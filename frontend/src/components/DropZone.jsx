import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'

export default function DropZone({ onFileUpload, disabled }) {
  const onDrop = useCallback(files => {
    if (disabled || files.length === 0) return
    const formData = new FormData()
    formData.append('file', files[0])
    onFileUpload(formData)
  }, [onFileUpload, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024, // 50MB cap
    disabled
  })

  return (
    <div
      {...getRootProps()}
      className={`relative overflow-hidden border-dashed border-2 p-12 rounded-[2rem] cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] space-y-6 group
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/40' :
          isDragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_40px_rgba(59,130,246,0.15)]' :
            'border-slate-700 bg-black/40 hover:border-blue-400 hover:bg-blue-900/10'}
      `}
    >
      {/* Decorative gradient background sweep */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${disabled ? 'hidden' : ''}`}></div>

      <input {...getInputProps()} />
      <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500
        ${isDragActive ? 'bg-blue-500/20 scale-110' : 'bg-slate-800 group-hover:bg-blue-900/30'}`}>
        <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-blue-400 animate-bounce' : 'text-slate-400 group-hover:text-blue-400'} transition-colors duration-300`} strokeWidth={1.5} />
      </div>

      <div className="text-center relative z-10">
        <p className={`text-xl font-bold tracking-wide transition-colors ${isDragActive ? 'text-blue-400' : 'text-slate-200'}`}>
          {isDragActive ? "Identify Payload..." : (disabled ? "Processing Acquisition..." : "Deploy Payload for Analysis")}
        </p>
        <p className="text-[13px] tracking-widest uppercase font-medium text-slate-500 mt-3">Maximum payload size 50MB</p>
      </div>
    </div>
  )
}
