import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, X, Plus, Trash, Edit } from 'lucide-react';
import { Task } from '@/interfaces';
interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updatedTask: { title: string; description: string }) => void;
  onAddComment: (taskId: string, comment: string) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onAddComment, 
  onUpdateComment, 
  onDeleteComment 
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
  }, [task]);

  const handleSave = () => {
    onUpdateTask(task._id, { title, description });
    onClose();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task._id, newComment);
      setNewComment('');
    }
  };

  const handleUpdateComment = (commentId: string) => {
    onUpdateComment(task._id, commentId, editedCommentContent);
    setEditingCommentId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Comments</label>
            <div className="space-y-2">
              {task.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2 text-sm">
                  {editingCommentId === comment._id ? (
                    <>
                      <Textarea
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                        className="flex-grow"
                      />
                      <Button size="sm" onClick={() => handleUpdateComment(comment._id)}>
                        <Save size={16} />
                      </Button>
                      <Button size="sm" onClick={() => setEditingCommentId(null)}>
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="flex-grow">{comment.content}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setEditingCommentId(comment._id);
                          setEditedCommentContent(comment.content);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onDeleteComment(task._id, comment._id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a new comment..."
                className="flex-grow"
              />
              <Button onClick={handleAddComment}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;