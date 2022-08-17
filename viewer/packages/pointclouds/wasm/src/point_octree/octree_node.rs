use crate::linalg::{BoundingBox,vec3,Vec3,Vec3WithIndex,boxes_overlap};

pub const MAX_POINTS_PER_NODE: usize = 1_000;
pub const MIN_OCTREE_NODE_SIZE: f64 = 0.0625;

use std::convert::TryInto;

use crate::shapes::shape::Shape;

#[derive(Debug)]
pub struct OctreeNode<'a> {
    children: Option<Box<[OctreeNode<'a>; 8]>>,
    points: Option<&'a [Vec3WithIndex]>,
    bounding_box: BoundingBox
}

impl<'a> OctreeNode<'a> {
    pub fn new(bounding_box: BoundingBox, points: &'a mut [Vec3WithIndex]) -> OctreeNode {
        if points.len() <= MAX_POINTS_PER_NODE ||
            bounding_box.max.x - bounding_box.min.x < MIN_OCTREE_NODE_SIZE {

            OctreeNode {
                children: Option::None,
                points: Option::Some(points),
                bounding_box: bounding_box
            }
        } else {
            let children = split(points, bounding_box);
            OctreeNode {
                children: Option::Some(children),
                points: Option::None,
                bounding_box: bounding_box
            }
        }
    }

    pub fn assign_object_ids(&self, bounding_box: &BoundingBox, shape: &Box<dyn Shape>, object_ids: &js_sys::Uint16Array) -> () {
        if self.children.is_some() {
            for child in self.children.as_ref().unwrap().iter() {
                if boxes_overlap(&child.bounding_box, bounding_box) {
                    child.assign_object_ids(bounding_box, shape, object_ids);
                }
            }
        } else {
            for point in self.points.as_ref().unwrap().iter() {
                if shape.contains_point(&point.vec) {
                    object_ids.set_index(point.index, shape.get_object_id() as u16);
                }
            }
        }
    }
}

fn split<'a>(points: &'a mut [Vec3WithIndex], bounding_box: BoundingBox) -> Box<[OctreeNode<'a>; 8]> {
    let middle = (bounding_box.min + bounding_box.max) / 2.0;
    let splits = find_splits(points, &middle);

    let mut split_maxes = splits.clone();
    split_maxes.rotate_left(1);
    split_maxes[7] = points.len();

    sort_points_into_sectors(points, splits, &middle);

    let boxes = get_child_bounding_boxes(&bounding_box);
    let mut box_iter = boxes.iter();

    let mut children = std::vec::Vec::<OctreeNode<'a>>::with_capacity(8);

    for i in 0..8 {
        let bb = box_iter.next().unwrap();

        unsafe {
            let ptr = points.as_mut_ptr().add(splits[i]);

            let slc = std::slice::from_raw_parts_mut(ptr, split_maxes[i] - splits[i]);

            children.push(OctreeNode::new(*bb, slc));

        }
    }

    Box::<[OctreeNode<'a>; 8]>::new(children.try_into().unwrap())
}

fn find_splits(points: &mut [Vec3WithIndex], middle: &Vec3) -> [usize; 8] {
    let mut sector_counts = [0;8];
    for point in points.iter() {
        let index = get_octree_child_index(point, &middle);
        sector_counts[index] += 1;
    }

    let mut accum_counts = [0; 8];

    for i in 1..8 {
        accum_counts[i] = accum_counts[i - 1] + sector_counts[i - 1];
    }

    accum_counts
}

fn get_octree_child_index(point: &Vec3WithIndex, middle: &Vec3) -> usize {
    ( if point.vec[0] < middle.x { 0 } else { 1 } ) +
        ( if point.vec[1] < middle.y { 0 } else { 2 } ) +
        ( if point.vec[2] < middle.z { 0 } else { 4 } )
}

/// Takes the indices with a starting index for each of the eight children and groups
/// the points into their corresponding slice. It does not allocate a new vector.
/// In essence, it moves one point at a time and puts it in the next available spot in
/// its slice. It then takes the point that was there before and repeats the process.
/// Whenever it comes back to the point where it started the current iteration, it breaks
/// and continues from the next slice that is not fully "sorted"
fn sort_points_into_sectors(points: &mut [Vec3WithIndex], splits: [usize; 8], middle: &Vec3) -> () {

    let mut offsets = splits.clone();
    let mut max_inds = splits.clone();
    max_inds.rotate_left(1);
    max_inds[7] = points.len();

    for current_partition in 0..8 {

        if offsets[current_partition] >= max_inds[current_partition] {
            // This slice is filled, don't iterate from this
            continue;
        }

        let initial_point_index = max_inds[current_partition] - 1;

        let mut current_point_index = initial_point_index;
        let mut current_point = points[current_point_index];

        loop {
            let octree_index = get_octree_child_index(&current_point, middle);

            let next_point_index = offsets[octree_index];
            let next_point = points[next_point_index];

            points[next_point_index] = current_point;

            current_point_index = next_point_index;
            current_point = next_point;

            offsets[octree_index] += 1;

            if current_point_index == initial_point_index {
                // We have reached a cycle - break loop
                break;
            }
        }
    }
}

fn get_child_bounding_boxes(bounding_box: &BoundingBox) -> [BoundingBox; 8] {
    let vecc = BoundingBox { min: vec3(0., 0., 0.), max: vec3(0., 0., 0.) };
    let mut boxes: [BoundingBox; 8] = [vecc; 8];

    let middle = (bounding_box.min + bounding_box.max) / 2.0;

    for i in 0..8 {
        let mut min = vec3(0., 0., 0.);
        let mut max = vec3(0., 0., 0.);

        (min.x, max.x) = if (i & 1) == 0 { (bounding_box.min.x, middle.x) } else { (middle.x, bounding_box.max.x) };
        (min.y, max.y) = if (i & 2) == 0 { (bounding_box.min.y, middle.y) } else { (middle.y, bounding_box.max.y) };
        (min.z, max.z) = if (i & 4) == 0 { (bounding_box.min.z, middle.z) } else { (middle.z, bounding_box.max.z) };

        boxes[i] = BoundingBox { min: min, max: max };
    }

    boxes
}

#[cfg(test)]
mod tests {

    use super::{Vec3WithIndex,vec3};
    use super::{find_splits,sort_points_into_sectors,get_octree_child_index};

    #[test]
    fn test_sector_inplace_sorting() {
        const NUM_POINTS: usize = 300;

        let mut points: Vec<Vec3WithIndex> = Vec::with_capacity(NUM_POINTS);

        let original_points = points.clone();

        for i in 0..NUM_POINTS {
            let p = vec3(((i * 4) as f64).sin(), ((i * 7) as f64).cos(), ((i * 3) as f64 + 0.12).sin());
            points.push(Vec3WithIndex {
                vec: p,
                index: i as u32
            });
        }

        let middle = vec3(0.0, 0.0, 0.0);

        let splits = find_splits(&mut points[..], &middle);
        sort_points_into_sectors(&mut points[..], splits, &middle);

        let mut num_points_checked = 0;

        for sector_index in 0..8 {
            let max_ind = if sector_index == 7 { points.len() } else { splits[sector_index + 1] };
            for point_index in splits[sector_index]..max_ind {
                assert_eq!(get_octree_child_index(&points[point_index], &middle), sector_index);
                num_points_checked += 1;
            }
        }

        for og_point in original_points {
            let mut found = false;
            for new_point in points.iter() {
                if new_point == &og_point {
                    found = true;
                    break;
                }
            }

            assert!(found);
        }

        assert_eq!(num_points_checked, points.len());
    }
}
