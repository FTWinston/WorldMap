interface kdPoint {
    [key:string]:number
};

class kdNode<TPoint> {
    constructor(public point: TPoint, public dimension: any, public parent?: kdNode<TPoint>) {
    }
    left?: kdNode<TPoint>;
    right?: kdNode<TPoint>;
}

class kdTree<TPoint extends TCoord, TCoord> {
    constructor(public points: TPoint[], public metric: (from: TPoint, to: TPoint) => number, public dimensions: string[]) {
        this.root = this.buildTree(points, 0) as kdNode<TPoint>;
    }
    root?: kdNode<TPoint>;

    buildTree(points: TPoint[], depth: number, parent?: kdNode<TPoint>) {
        let dim = depth % this.dimensions.length;

        if (points.length === 0)
            return undefined;
        if (points.length === 1)
            return new kdNode(this.points[0], dim, parent);

        (points as any[] as kdPoint[]).sort(function (a: kdPoint, b: kdPoint) {
            return a[this.dimensions[dim]] - b[this.dimensions[dim]];
        }.bind(this));

        let median = Math.floor(points.length / 2);
        let node = new kdNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

        return node;
    }

    insert(point: TPoint) {
        let innerSearch = function(node?: kdNode<TPoint>, parent?: kdNode<TPoint>): kdNode<TPoint> | undefined {
            if (node === undefined)
                return parent;

            let dimension = this.dimensions[node.dimension];
            if ((point as any as kdPoint)[dimension] < (node.point as any as kdPoint)[dimension])
                return innerSearch(node.left, node);
            else
                return innerSearch(node.right, node);
        }.bind(this);

        var insertPosition = innerSearch(this.root),
        newNode,
        dimension;

        if (insertPosition === undefined) {
            this.root = new kdNode(point, 0);
            return;
        }

        newNode = new kdNode(point, (insertPosition.dimension + 1) % this.dimensions.length, insertPosition);
        dimension = this.dimensions[insertPosition.dimension];

        if ((point as any as kdPoint)[dimension] < (insertPosition.point as any as kdPoint)[dimension])
            insertPosition.left = newNode;
        else
            insertPosition.right = newNode;
    }

    remove(point: TPoint) {
        if (this.root === undefined)
            return;

        let nodeSearch = function (node: kdNode<TPoint>) {
            if (node === null)
                return undefined;

            if (node.point === point)
                return node;

            var dimension = this.dimensions[node.dimension];

            if ((point as any as kdPoint)[dimension] < (node.point as any as kdPoint)[dimension])
                return this.nodeSearch(node.left, node);
            else
                return this.nodeSearch(node.right, node);
        }.bind(this);

        let removeNode = function(node: kdNode<TPoint>) {
            let findMin = function(node: kdNode<TPoint> | undefined, dim: string): kdNode<TPoint> | undefined {
                if (node === undefined)
                    return undefined;

                let dimension = this.dimensions[dim];

                if (node.dimension === dim) {
                    if (node.left !== undefined)
                        return findMin(node.left, dim);
                    else
                        return node;
                }

                let own = (node.point as any as kdPoint)[dimension];
                let left = findMin(node.left, dim);
                let right = findMin(node.right, dim);
                let min = node;

                if (left !== undefined && (left.point as any as kdPoint)[dimension] < own)
                    min = left;

                if (right !== undefined && (right.point as any as kdPoint)[dimension] < (min.point as any as kdPoint)[dimension])
                    min = right;

                return min;
            }.bind(this);

            if (node.left === undefined && node.right === undefined) {
                if (node.parent === undefined) {
                    this.root = undefined;
                    return;
                }

                let pDimension = this.dimensions[node.parent.dimension];

                if ((node.point as any as kdPoint)[pDimension] < (node.parent.point as any as kdPoint)[pDimension])
                    node.parent.left = undefined;
                else
                    node.parent.right = undefined;
                
                return;
            }

            // If the right subtree is not empty, swap with the minimum element on the
            // node's dimension. If it is empty, we swap the left and right subtrees and
            // do the same.
            if (node.right !== undefined) {
                let nextNode = findMin(node.right, node.dimension) as kdNode<TPoint>;
                let nextObj = nextNode.point;
                removeNode(nextNode);          
                node.point = nextObj;
            }
            else {
                let nextNode = findMin(node.left, node.dimension) as kdNode<TPoint>;
                let nextObj = nextNode.point;
                removeNode(nextNode);
                node.right = node.left;
                node.left = undefined;
                node.point = nextObj;
            }
        }.bind(this);

        let node = nodeSearch(this.root);

        if (node !== undefined)
            removeNode(node);
    }
    
    nearest(point: TCoord, maxDistance?: number) {
        var bestNode: kdNode<TPoint> | undefined = undefined;
        var bestDist = Number.MAX_VALUE;

        let nearestSearch = function(node: kdNode<TPoint>) {
            let dimension = this.dimensions[node.dimension];
            let ownDistance = this.metric(point, node.point);
            let linearPoint: {[key:string]:number} = {};

            for (let i = 0; i < this.dimensions.length; i += 1) {
                if (i === node.dimension)
                    linearPoint[this.dimensions[i]] = (point as any as kdPoint)[this.dimensions[i]];
                else
                    linearPoint[this.dimensions[i]] = (node.point as any as kdPoint)[this.dimensions[i]];
            }

            let linearDistance = this.metric(linearPoint, node.point);

            if (node.right === null && node.left === null) {
                if (ownDistance < bestDist) {
                    bestNode = node;
                    bestDist = ownDistance;
                }
                return;
            }

            let bestChild;
            if (node.right === undefined)
                bestChild = node.left;
            else if (node.left === undefined)
                bestChild = node.right;
            else if ((point as any as kdPoint)[dimension] < (node.point as any as kdPoint)[dimension])
                bestChild = node.left;
            else
                bestChild = node.right;

            nearestSearch(bestChild as kdNode<TPoint>);

            if (ownDistance < bestDist) {
                bestNode = node;
                bestDist = ownDistance;
            }

            if (Math.abs(linearDistance) < bestDist) {
                let otherChild;
                if (bestChild === node.left)
                    otherChild = node.right;
                else
                    otherChild = node.left;

                if (otherChild !== undefined)
                    nearestSearch(otherChild);
            }
        }.bind(this);

        if(this.root)
            nearestSearch.bind(this.root);

        return bestNode === undefined ? undefined : (bestNode as kdNode<TPoint>).point;
    }

    balanceFactor() {
        function height(node?: kdNode<TPoint>): number {
            if (node === undefined)
                return 0;
            
            return Math.max(height(node.left), height(node.right)) + 1;
        }

        function count(node?: kdNode<TPoint>): number {
            if (node === undefined)
                return 0;
            return count(node.left) + count(node.right) + 1;
        }

        return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
    }
}
