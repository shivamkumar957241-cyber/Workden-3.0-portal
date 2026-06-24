import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Upload } from "lucide-react";

export default function TaskWorkPage({ taskName, taskDescription, taskId, reward }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const submitWorkMutation = useMutation({
    mutationFn: async ({ taskId, file, notes }) => {
      const user = await base44.auth.me();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      return base44.entities.Proof.create({
        user_id: user.id,
        task_id: taskId,
        task_name: taskName,
        file_url: file_url,
        status: "pending",
        submitted_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-proofs'] });
      alert("Work submitted successfully! Admin will review it soon.");
      setFile(null);
      setNotes("");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please upload your work file");
      return;
    }

    setSubmitting(true);
    try {
      await submitWorkMutation.mutateAsync({ taskId, file, notes });
    } catch (error) {
      console.error("Error submitting work:", error);
      alert("Failed to submit work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{taskName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{taskDescription}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                Reward: ₹{reward}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit Your Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="work-file">Upload Work File *</Label>
                <Input
                  id="work-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  required
                />
                <p className="text-xs text-slate-500">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX, TXT
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any comments about your work..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || !file}
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Work
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
