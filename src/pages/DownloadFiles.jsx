import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FolderOpen, ExternalLink } from "lucide-react";

export default function DownloadFiles() {
  const { data: globalSettings = [] } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => base44.entities.GlobalSettings.list(),
    initialData: [],
  });

  const adminFilesLink = globalSettings.find(s => s.setting_key === 'admin_files')?.setting_value
    || "https://drive.google.com/drive/folders/1TGtMK5h6208lxnYF2HJtKSc1yx4hTgDC?usp=drive_link";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8 pb-24">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Download className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Download Work Files
            </h1>
          </div>
          <p className="text-gray-600">Access important work files and resources from Google Drive</p>
        </div>

        <Card className="shadow-2xl border-2 border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Work Files Folder</h2>
            <p className="text-blue-100 text-sm mb-6">Click the button below to open the Google Drive folder with all work files</p>
            <a href={adminFilesLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg px-8 py-6 shadow-lg">
                <ExternalLink className="w-5 h-5 mr-2" /> Open in Google Drive
              </Button>
            </a>
          </div>
          <CardContent className="p-5 bg-amber-50">
            <h3 className="font-bold text-amber-900 mb-2">📋 How to Download Files</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Click "Open in Google Drive" above</li>
              <li>• Browse the folder and click any file to preview</li>
              <li>• Right-click any file → Download to save to your device</li>
              <li>• Login to Google if prompted</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}