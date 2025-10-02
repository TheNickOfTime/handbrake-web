import {
	OperationNodeTransformer,
	PrimitiveValueListNode,
	ValueNode,
	type KyselyPlugin,
	type PluginTransformQueryArgs,
	type PluginTransformResultArgs,
	type QueryResult,
	type RootOperationNode,
	type UnknownRow,
} from 'kysely';

export class SqliteBooleanPlugin implements KyselyPlugin {
	readonly #transformer = new SqliteBooleanTransformer();

	transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
		return this.#transformer.transformNode(args.node);
	}

	transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
		return Promise.resolve(args.result);
	}
}

class SqliteBooleanTransformer extends OperationNodeTransformer {
	override transformValue(node: ValueNode): ValueNode {
		return {
			...super.transformValue(node),
			value: this.serialize(node.value),
		};
	}

	transformPrimitiveValueList(node: PrimitiveValueListNode): PrimitiveValueListNode {
		return {
			...super.transformPrimitiveValueList(node),
			values: node.values.map((value) => this.serialize(value)),
		};
	}

	private serialize(value: unknown) {
		return typeof value === 'boolean' ? (value ? 1 : 0) : value;
	}
}
