import { relations, sql } from "drizzle-orm";
import {
	boolean,
	check,
	foreignKey,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const moveLevelEnum = pgEnum("move_level", [
	"Beginner",
	"Intermediate",
	"Advanced",
]);
export const moveStatusEnum = pgEnum("move_status", ["WANT", "ALMOST", "DONE"]);
export const languageEnum = pgEnum("language", ["en", "pl"]);

export const profiles = pgTable(
	"profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id").notNull().unique(), // Foreign key to auth.users(id) in Supabase
		name: text("name"),
		avatarUrl: text("avatar_url"),
		isAdmin: boolean("is_admin").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		nameLengthCheck: check(
			"profile_name_length_check",
			sql`${table.name} IS NULL OR char_length(${table.name}) between 2 and 100`
		),
	})
);

export const moves = pgTable(
	"moves",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		level: moveLevelEnum("level").notNull(),
		slug: text("slug").notNull(),
		imageUrl: text("image_url"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		deletedAt: timestamp("deleted_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		nameLengthCheck: check(
			"name_length_check",
			sql`char_length(${table.name}) between 3 and 100`
		),

		nameActiveIdx: uniqueIndex("idx_moves_name_active")
			.on(sql`lower(${table.name})`)
			.where(sql`${table.deletedAt} IS NULL`),
		slugUniqueIdx: uniqueIndex("idx_moves_slug_unique").on(
			sql`lower(${table.slug})`
		),
	})
);

export const steps = pgTable(
	"steps",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		moveId: uuid("move_id")
			.notNull()
			.references(() => moves.id, { onDelete: "cascade" }),
		orderIndex: integer("order_index").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		orderIndexCheck: check("order_index_check", sql`${table.orderIndex} > 0`),
		moveOrderUnique: unique("move_order_unique").on(
			table.moveId,
			table.orderIndex
		),
	})
);

export const userMoveStatuses = pgTable(
	"user_move_statuses",
	{
		userId: uuid("user_id").notNull(), // Foreign key to auth.users(id) in Supabase
		moveId: uuid("move_id")
			.notNull()
			.references(() => moves.id, { onDelete: "cascade" }),
		status: moveStatusEnum("status").default("WANT").notNull(),
		note: text("note"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.moveId] }),
		noteLengthCheck: check(
			"note_length_check",
			sql`char_length(${table.note}) <= 2000`
		),
	})
);

export const moveNotes = pgTable(
	"move_notes",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id").notNull(),
		moveId: uuid("move_id")
			.notNull()
			.references(() => moves.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		contentLengthCheck: check(
			"content_length_check",
			sql`char_length(${table.content}) <= 2000`
		),
		userMoveFK: foreignKey({
			columns: [table.userId, table.moveId],
			foreignColumns: [userMoveStatuses.userId, userMoveStatuses.moveId],
			name: "move_notes_user_move_fk",
		}),
	})
);

export const movesRelations = relations(moves, ({ many }) => ({
	steps: many(steps),
	userMoveStatuses: many(userMoveStatuses),
	translations: many(moveTranslations),
}));

export const stepsRelations = relations(steps, ({ one, many }) => ({
	move: one(moves, {
		fields: [steps.moveId],
		references: [moves.id],
	}),
	translations: many(stepTranslations),
}));

export const userMoveStatusesRelations = relations(
	userMoveStatuses,
	({ one, many }) => ({
		move: one(moves, {
			fields: [userMoveStatuses.moveId],
			references: [moves.id],
		}),
		notes: many(moveNotes),
	})
);

export const moveNotesRelations = relations(moveNotes, ({ one }) => ({
	userMoveStatus: one(userMoveStatuses, {
		fields: [moveNotes.userId, moveNotes.moveId],
		references: [userMoveStatuses.userId, userMoveStatuses.moveId],
	}),
}));

export const moveTranslations = pgTable(
	"move_translations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		moveId: uuid("move_id")
			.notNull()
			.references(() => moves.id, { onDelete: "cascade" }),
		language: languageEnum("language").notNull(),
		description: text("description").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		moveLanguageUnique: unique("move_language_unique").on(
			table.moveId,
			table.language
		),
		descriptionLengthCheck: check(
			"move_trans_description_length_check",
			sql`char_length(${table.description}) between 10 and 1000`
		),
	})
);

export const moveTranslationsRelations = relations(
	moveTranslations,
	({ one }) => ({
		move: one(moves, {
			fields: [moveTranslations.moveId],
			references: [moves.id],
		}),
	})
);

export const stepTranslations = pgTable(
	"step_translations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		stepId: uuid("step_id")
			.notNull()
			.references(() => steps.id, { onDelete: "cascade" }),
		language: languageEnum("language").notNull(),
		title: text("title").notNull(),
		description: text("description").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		stepLanguageUnique: unique("step_language_unique").on(
			table.stepId,
			table.language
		),
		titleLengthCheck: check(
			"step_trans_title_length_check",
			sql`char_length(${table.title}) between 3 and 350`
		),
		descriptionLengthCheck: check(
			"step_trans_description_length_check",
			sql`char_length(${table.description}) between 10 and 350`
		),
	})
);

export const stepTranslationsRelations = relations(
	stepTranslations,
	({ one }) => ({
		step: one(steps, {
			fields: [stepTranslations.stepId],
			references: [steps.id],
		}),
	})
);
