import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  Key,
  Link as LinkIcon,
  Save,
  Trash,
  Edit,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getServiceNowCredentials } from "@/lib/servicenow";
import { useAuth } from "@/context/AuthContext";

interface ServiceNowCredential {
  id: string;
  name: string;
  instanceUrl: string;
  username: string;
  password: string;
}

interface ServiceNowCredentialsProps {
  credentials?: ServiceNowCredential[];
  onSave?: (credential: ServiceNowCredential) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, credential: Omit<ServiceNowCredential, "id">) => void;
}

const ServiceNowCredentials = ({
  credentials = [],
  onSave = () => {},
  onDelete = () => {},
  onUpdate = () => {},
}: ServiceNowCredentialsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [savedCredentials, setSavedCredentials] =
    useState<ServiceNowCredential[]>(credentials);
  const [newCredential, setNewCredential] = useState<
    Omit<ServiceNowCredential, "id">
  >({
    name: "",
    instanceUrl: "",
    username: "",
    password: "",
  });
  const [editingCredential, setEditingCredential] = useState<string | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState<
    Omit<ServiceNowCredential, "id">
  >({
    name: "",
    instanceUrl: "",
    username: "",
    password: "",
  });

  // Load credentials when component mounts
  useEffect(() => {
    const loadCredentials = async () => {
      if (user) {
        try {
          const creds = await getServiceNowCredentials(user.id);
          setSavedCredentials(
            creds.map((cred) => ({
              id: cred.id,
              name: cred.name,
              instanceUrl: cred.instance_url,
              username: cred.username,
              password: cred.password,
            })),
          );
        } catch (error) {
          console.error("Error loading credentials:", error);
        }
      }
    };

    loadCredentials();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCredential((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCredential = () => {
    // Validate inputs
    if (
      !newCredential.name ||
      !newCredential.instanceUrl ||
      !newCredential.username ||
      !newCredential.password
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Log the credential being saved
    console.log(
      "Saving credential in ServiceNowCredentials component:",
      newCredential,
    );

    // Create new credential with ID
    const credentialWithId = {
      ...newCredential,
      id: Date.now().toString(),
    };

    // Update state
    setSavedCredentials((prev) => [...prev, credentialWithId]);

    // Call parent handler
    onSave(credentialWithId);

    // Reset form
    setNewCredential({ name: "", instanceUrl: "", username: "", password: "" });

    // Show success message
    toast({
      title: "Credentials saved",
      description: `ServiceNow credentials for ${newCredential.name} have been saved.`,
    });
  };

  const handleDeleteCredential = (id: string, name: string) => {
    setSavedCredentials((prev) => prev.filter((cred) => cred.id !== id));
    onDelete(id);

    toast({
      title: "Credentials deleted",
      description: `ServiceNow credentials for ${name} have been removed.`,
    });
  };

  const handleEditCredential = (credential: ServiceNowCredential) => {
    setEditingCredential(credential.id);
    setEditFormData({
      name: credential.name,
      instanceUrl: credential.instanceUrl,
      username: credential.username,
      password: credential.password,
    });
  };

  const handleUpdateCredential = (id: string) => {
    // Validate inputs
    if (
      !editFormData.name ||
      !editFormData.instanceUrl ||
      !editFormData.username
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Update in local state
    setSavedCredentials((prev) =>
      prev.map((cred) =>
        cred.id === id ? { ...cred, ...editFormData } : cred,
      ),
    );

    // Call parent handler
    onUpdate(id, editFormData);

    // Reset editing state
    setEditingCredential(null);

    // Show success message
    toast({
      title: "Credentials updated",
      description: `ServiceNow credentials for ${editFormData.name} have been updated.`,
    });
  };

  const cancelEditing = () => {
    setEditingCredential(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2" size={20} />
            Add ServiceNow Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Production Instance"
                value={newCredential.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="instanceUrl">Instance URL</Label>
              <div className="flex items-center">
                <LinkIcon size={16} className="mr-2 text-gray-400" />
                <Input
                  id="instanceUrl"
                  name="instanceUrl"
                  placeholder="https://your-instance.service-now.com"
                  value={newCredential.instanceUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="admin"
                value={newCredential.username}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center">
                <Key size={16} className="mr-2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={newCredential.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveCredential} className="w-full">
            <Save size={16} className="mr-2" />
            Save Credentials
          </Button>
        </CardContent>
      </Card>

      {savedCredentials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved ServiceNow Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="border rounded-md overflow-hidden"
                >
                  {editingCredential === cred.id ? (
                    <div className="p-3 space-y-3">
                      <div>
                        <Label htmlFor={`edit-name-${cred.id}`}>
                          Connection Name
                        </Label>
                        <Input
                          id={`edit-name-${cred.id}`}
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-instanceUrl-${cred.id}`}>
                          Instance URL
                        </Label>
                        <Input
                          id={`edit-instanceUrl-${cred.id}`}
                          name="instanceUrl"
                          value={editFormData.instanceUrl}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-username-${cred.id}`}>
                          Username
                        </Label>
                        <Input
                          id={`edit-username-${cred.id}`}
                          name="username"
                          value={editFormData.username}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-password-${cred.id}`}>
                          Password
                        </Label>
                        <Input
                          id={`edit-password-${cred.id}`}
                          name="password"
                          type="password"
                          placeholder="Leave blank to keep current password"
                          value={editFormData.password}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleUpdateCredential(cred.id)}
                        >
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="font-medium">{cred.name}</h3>
                        <p className="text-sm text-gray-500">
                          {cred.instanceUrl}
                        </p>
                        <p className="text-xs text-gray-400">
                          Username: {cred.username}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCredential(cred)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteCredential(cred.id, cred.name)
                          }
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceNowCredentials;
