import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "./prisma";
import { authMiddleware, registerUser, loginUser, AuthRequest } from "./auth";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, username, password, displayName } = req.body;

      if (!email || !username || !password) {
        res.status(400).json({ error: "Email, username, and password are required" });
        return;
      }

      const result = await registerUser(email, username, password, displayName);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({ error: message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const result = await loginUser(email, password);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ error: message });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/auth/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { displayName, avatarUrl } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { displayName, avatarUrl },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/projects", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId: req.user!.id },
          },
        },
        include: {
          members: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
          },
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, color } = req.body;

      if (!name) {
        res.status(400).json({ error: "Project name is required" });
        return;
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          color: color || "#2563EB",
          members: {
            create: {
              userId: req.user!.id,
              role: "owner",
            },
          },
        },
        include: {
          members: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
          },
        },
      });

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: req.params.id,
          members: { some: { userId: req.user!.id } },
        },
        include: {
          members: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
          },
          tasks: {
            include: {
              assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
              _count: { select: { comments: true, attachments: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, color } = req.body;

      const project = await prisma.project.updateMany({
        where: {
          id: req.params.id,
          members: { some: { userId: req.user!.id } },
        },
        data: { name, description, color },
      });

      if (project.count === 0) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      const updated = await prisma.project.findUnique({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId: req.params.id,
          userId: req.user!.id,
          role: "owner",
        },
      });

      if (!membership) {
        res.status(403).json({ error: "Only owner can delete project" });
        return;
      }

      await prisma.project.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.post("/api/projects/:id/members", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { email, role } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: req.params.id, userId: user.id },
      });

      if (existingMember) {
        res.status(400).json({ error: "User is already a member" });
        return;
      }

      const member = await prisma.projectMember.create({
        data: {
          projectId: req.params.id,
          userId: user.id,
          role: role || "member",
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  app.get("/api/tasks", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { projectId, status, priority, assigneeId } = req.query;

      const tasks = await prisma.task.findMany({
        where: {
          project: { members: { some: { userId: req.user!.id } } },
          ...(projectId && { projectId: projectId as string }),
          ...(status && { status: status as string }),
          ...(priority && { priority: priority as string }),
          ...(assigneeId && { assigneeId: assigneeId as string }),
        },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { comments: true, attachments: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, projectId, status, priority, dueDate, assigneeId } = req.body;

      if (!title || !projectId) {
        res.status(400).json({ error: "Title and project are required" });
        return;
      }

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          members: { some: { userId: req.user!.id } },
        },
      });

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          projectId,
          status: status || "todo",
          priority: priority || "medium",
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId,
          creatorId: req.user!.id,
        },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.get("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          project: { members: { some: { userId: req.user!.id } } },
        },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          comments: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: "asc" },
          },
          attachments: {
            include: { uploader: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.put("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, status, priority, dueDate, assigneeId } = req.body;

      const task = await prisma.task.updateMany({
        where: {
          id: req.params.id,
          project: { members: { some: { userId: req.user!.id } } },
        },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(assigneeId !== undefined && { assigneeId }),
        },
      });

      if (task.count === 0) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      const updated = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: {
          project: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          project: { members: { some: { userId: req.user!.id } } },
        },
      });

      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      await prisma.task.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.post("/api/tasks/:id/comments", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ error: "Content is required" });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          project: { members: { some: { userId: req.user!.id } } },
        },
      });

      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          taskId: req.params.id,
          userId: req.user!.id,
        },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      });

      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.post(
    "/api/tasks/:id/attachments",
    authMiddleware,
    upload.single("file"),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "File is required" });
          return;
        }

        const task = await prisma.task.findFirst({
          where: {
            id: req.params.id,
            project: { members: { some: { userId: req.user!.id } } },
          },
        });

        if (!task) {
          res.status(404).json({ error: "Task not found" });
          return;
        }

        const attachment = await prisma.attachment.create({
          data: {
            filename: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            mimeType: req.file.mimetype,
            size: req.file.size,
            taskId: req.params.id,
            uploaderId: req.user!.id,
          },
          include: {
            uploader: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        });

        res.json(attachment);
      } catch (error) {
        res.status(500).json({ error: "Failed to upload attachment" });
      }
    }
  );

  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  app.get("/api/team", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const projectIds = await prisma.projectMember.findMany({
        where: { userId: req.user!.id },
        select: { projectId: true },
      });

      const teamMembers = await prisma.user.findMany({
        where: {
          projects: {
            some: {
              projectId: { in: projectIds.map((p) => p.projectId) },
            },
          },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          email: true,
          _count: {
            select: { assignedTasks: true },
          },
        },
      });

      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
