'use client'

import * as React from 'react'
import { Upload, Loader2, Check, AlertCircle, Calendar as CalendarIcon, MapPin, X, FileText, Sparkles } from 'lucide-react'
import { syncEventsToSupabase } from './_actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface UploadingFile {
  id: string;
  file: File;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  previewUrl?: string;
  error?: string;
}

export default function StaffEventsPage() {
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadingFile[]>([])
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [editData, setEditData] = React.useState<any[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [reasoning, setReasoning] = React.useState<string>("")
  const [isExtracting, setIsExtracting] = React.useState(false)

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      status: 'pending' as const,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setUploadingFiles(prev => [...prev, ...newFiles])
    setIsExtracting(true)
    setReasoning("")

    // Process each file
    for (const fileObj of newFiles) {
      updateFileStatus(fileObj.id, 'uploading')

      const formData = new FormData()
      formData.append('file', fileObj.file)

      try {
        const response = await fetch('/staff/api/calendar/extract', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Server returned ${response.status}`)
        
        const reader = response.body?.getReader()
        if (!reader) throw new Error("Could not initialize stream reader")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const chunk = JSON.parse(line)
              if (chunk.type === "text") {
                setReasoning(prev => prev + chunk.content)
              } else if (chunk.type === "json") {
                const data = chunk.content
                if (data.events) {
                  updateFileStatus(fileObj.id, 'success')
                  setEditData(prev => {
                    const incomingEvents = data.events.map((e: any) => ({
                      ...e,
                      sourceFile: fileObj.name
                    }))
                    return [...prev, ...incomingEvents].sort((a, b) => (a.date_iso || '').localeCompare(b.date_iso || ''))
                  })
                }
              } else if (chunk.type === "error") {
                throw new Error(chunk.content)
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e)
            }
          }
        }
      } catch (err: any) {
        updateFileStatus(fileObj.id, 'error', err.message)
        setError(err.message)
      }
    }
    setIsExtracting(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const updateFileStatus = (id: string, status: UploadingFile['status'], error?: string) => {
    setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status, error } : f))
  }

  const handleEdit = (index: number, field: string, value: any) => {
    const newData = [...editData]
    newData[index] = { ...newData[index], [field]: value }
    setEditData(newData)
  }

  const removeFile = (id: string) => {
    setUploadingFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl)
      return prev.filter(f => f.id !== id)
    })
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setError(null)
    
    const result = await syncEventsToSupabase(editData)
    if (result.success) {
      alert('Successfully synced events to Supabase!')
      setEditData([])
      setUploadingFiles([])
      setReasoning("")
    } else {
      setError(result.error || 'Failed to sync events')
    }
    setIsSyncing(false)
  }

  const clearAll = () => {
    uploadingFiles.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    setUploadingFiles([])
    setEditData([])
    setError(null)
    setReasoning("")
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2D1E17]">Event Management</h1>
          <p className="text-[#6B5A4E]">Upload calendar images to automatically extract and sync events.</p>
        </div>
        {(editData.length > 0 || uploadingFiles.length > 0) && (
          <Button variant="ghost" onClick={clearAll} className="text-zinc-400 hover:text-red-500">
            Clear Everything
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Upload & Preview Section */}
        <div className={cn("grid gap-6", uploadingFiles.length > 0 ? "lg:grid-cols-3" : "grid-cols-1")}>
          <Card 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "border-dashed border-2 transition-all duration-200 cursor-pointer relative overflow-hidden group",
              isDragging ? "border-[#E89D71] bg-[#FEF3EB] scale-[1.01]" : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50",
              uploadingFiles.length > 0 ? "h-48" : "py-16"
            )}
          >
            <CardHeader className={cn("text-center", uploadingFiles.length > 0 ? "py-6" : "py-0")}>
              <div className={cn(
                "mx-auto rounded-full flex items-center justify-center transition-all duration-200",
                isDragging ? "bg-[#E89D71] scale-110" : "bg-[#FEF3EB]",
                uploadingFiles.length > 0 ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"
              )}>
                <Upload className={cn(
                  "transition-colors duration-200",
                  isDragging ? "text-white" : "text-[#E89D71]",
                  uploadingFiles.length > 0 ? "w-6 h-6" : "w-8 h-8"
                )} />
              </div>
              <CardTitle className={cn(
                "transition-colors duration-200",
                isDragging ? "text-[#2D1E17]" : "text-xl",
                uploadingFiles.length > 0 ? "text-base" : "text-2xl"
              )}>
                {isDragging ? "Drop here" : (uploadingFiles.length > 0 ? "Add more" : "Upload Calendars")}
              </CardTitle>
              {uploadingFiles.length === 0 && !isDragging && (
                <CardDescription className="max-w-xs mx-auto text-base mt-2">
                  PNG, JPG, PDF supported
                </CardDescription>
              )}
              <input 
                type="file" 
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
              />
            </CardHeader>
          </Card>

          {/* Preview Grid */}
          {uploadingFiles.length > 0 && (
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="relative group aspect-video rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-zinc-50">
                      <FileText className="w-8 h-8 text-zinc-300" />
                      <p className="text-[10px] text-zinc-400 mt-2 truncate w-full text-center">{file.name}</p>
                    </div>
                  )}
                  
                  {/* Overlay Status */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center transition-opacity bg-black/40 text-white",
                    file.status === 'uploading' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {file.status === 'uploading' && <Loader2 className="w-6 h-6 animate-spin mb-1" />}
                    {file.status === 'success' && <div className="bg-green-500 rounded-full p-1 mb-1"><Check className="w-4 h-4" /></div>}
                    {file.status === 'error' && <div className="bg-red-500 rounded-full p-1 mb-1"><AlertCircle className="w-4 h-4" /></div>}
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {file.status === 'uploading' ? 'Extracting...' : file.status}
                    </p>
                  </div>

                  <button 
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reasoning Stream Section */}
        {(reasoning || isExtracting) && (
          <Card className="border-[#86B1A4]/30 bg-[#E8F3F0]/20 animate-in fade-in slide-in-from-top-4 duration-700">
            <CardHeader className="flex flex-row items-center gap-3 py-4">
              <div className="bg-[#86B1A4] p-2 rounded-lg">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[#2D3E3A]">AI Reasoning Process</CardTitle>
                <CardDescription className="text-xs">Extracting structured data from your calendar...</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white/50 rounded-xl p-4 border border-[#86B1A4]/10 min-h-[100px] max-h-[300px] overflow-y-auto">
                <div className="prose prose-sm max-w-none text-[#4A5A56] font-medium leading-relaxed whitespace-pre-wrap">
                  {reasoning}
                  {isExtracting && <span className="inline-block w-1.5 h-4 bg-[#86B1A4] animate-pulse ml-1 align-middle" />}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extracted Events Table */}
      {editData.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#2D1E17]">Extracted Events</h2>
                <span className="px-3 py-1 bg-[#FEF3EB] text-[#E89D71] rounded-full text-sm font-bold">
                  {editData.length} Total
                </span>
              </div>
              <p className="text-[#6B5A4E] mt-1">Review and refine the extracted data before syncing to Supabase.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button className="flex-1 md:flex-none bg-[#E89D71] hover:bg-[#D88C61] text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-[#E89D71]/20 transition-all hover:scale-[1.02]" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Confirm & Sync to Supabase
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <Card className="rounded-3xl overflow-hidden border-zinc-100 shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[30%] font-bold">Event Name</TableHead>
                  <TableHead className="w-[20%] font-bold">Event Date</TableHead>
                  <TableHead className="w-[20%] font-bold">Event Time (24h)</TableHead>
                  <TableHead className="w-[30%] font-bold">Event Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editData.map((event, index) => (
                  <TableRow key={index} className="hover:bg-zinc-50/30 transition-colors group">
                    <TableCell>
                      <Input 
                        value={event.title} 
                        onChange={(e) => handleEdit(index, 'title', e.target.value)}
                        className="bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-[#E89D71] transition-all font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <Input 
                          type="date"
                          value={event.date_iso} 
                          onChange={(e) => handleEdit(index, 'date_iso', e.target.value)}
                          className="bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-[#E89D71] transition-all"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input 
                          value={event.start_time || ''} 
                          onChange={(e) => handleEdit(index, 'start_time', e.target.value)}
                          placeholder="00:00"
                          className="bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-[#E89D71] transition-all w-16 px-1 text-center"
                        />
                        <span className="text-zinc-300">-</span>
                        <Input 
                          value={event.end_time || ''} 
                          onChange={(e) => handleEdit(index, 'end_time', e.target.value)}
                          placeholder="00:00"
                          className="bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-[#E89D71] transition-all w-16 px-1 text-center"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                        <Input 
                          value={event.location || ''} 
                          onChange={(e) => handleEdit(index, 'location', e.target.value)}
                          className="bg-transparent border-transparent hover:border-zinc-200 focus:bg-white focus:border-[#E89D71] transition-all"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  )
}
