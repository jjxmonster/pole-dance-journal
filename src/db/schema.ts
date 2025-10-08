import { sql } from "drizzle-orm";
import {
	boolean,
	check,
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

export const profiles = pgTable("profiles", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().unique(), // Foreign key to auth.users(id) in Supabase
	isAdmin: boolean("is_admin").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const moves = pgTable(
	"moves",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		description: text("description").notNull(),
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
		descriptionLengthCheck: check(
			"description_length_check",
			sql`char_length(${table.description}) between 10 and 500`
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
		orderIndexCheck: check("order_index_check", sql`${table.orderIndex} > 0`),
		titleLengthCheck: check(
			"title_length_check",
			sql`char_length(${table.title}) between 3 and 150`
		),
		descriptionLengthCheck: check(
			"description_length_check",
			sql`char_length(${table.description}) between 10 and 150`
		),
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
