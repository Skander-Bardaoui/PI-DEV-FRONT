/**
 * Tests for CollaborationSkeletonLoaders components
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TeamMemberRowSkeleton,
  TaskCardSkeleton,
  ActivityItemSkeleton,
  StatsCardSkeleton,
  InvitationCardSkeleton,
} from './CollaborationSkeletonLoaders';

describe('TeamMemberRowSkeleton', () => {
  it('should render table row', () => {
    const { container } = render(
      <table>
        <tbody>
          <TeamMemberRowSkeleton />
        </tbody>
      </table>
    );

    expect(container.querySelector('tr')).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(
      <table>
        <tbody>
          <TeamMemberRowSkeleton />
        </tbody>
      </table>
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render avatar skeleton', () => {
    const { container } = render(
      <table>
        <tbody>
          <TeamMemberRowSkeleton />
        </tbody>
      </table>
    );

    const avatar = container.querySelector('.h-10.w-10.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('should render multiple skeleton elements', () => {
    const { container } = render(
      <table>
        <tbody>
          <TeamMemberRowSkeleton />
        </tbody>
      </table>
    );

    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(5);
  });
});

describe('TaskCardSkeleton', () => {
  it('should render card container', () => {
    const { container } = render(<TaskCardSkeleton />);

    expect(container.querySelector('.bg-white.rounded-lg')).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<TaskCardSkeleton />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should have border', () => {
    const { container } = render(<TaskCardSkeleton />);

    expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
  });

  it('should render multiple skeleton elements', () => {
    const { container } = render(<TaskCardSkeleton />);

    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(3);
  });
});

describe('ActivityItemSkeleton', () => {
  it('should render activity item', () => {
    const { container } = render(<ActivityItemSkeleton />);

    expect(container.querySelector('.relative')).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<ActivityItemSkeleton />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render circular icon placeholder', () => {
    const { container } = render(<ActivityItemSkeleton />);

    const circle = container.querySelector('.rounded-full');
    expect(circle).toBeInTheDocument();
  });

  it('should have absolute positioning for icon', () => {
    const { container } = render(<ActivityItemSkeleton />);

    expect(container.querySelector('.absolute')).toBeInTheDocument();
  });
});

describe('StatsCardSkeleton', () => {
  it('should render card container', () => {
    const { container } = render(<StatsCardSkeleton />);

    expect(container.querySelector('.bg-white.rounded-xl')).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<StatsCardSkeleton />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should have padding', () => {
    const { container } = render(<StatsCardSkeleton />);

    expect(container.querySelector('.p-4')).toBeInTheDocument();
  });

  it('should render skeleton elements', () => {
    const { container } = render(<StatsCardSkeleton />);

    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBe(2);
  });
});

describe('InvitationCardSkeleton', () => {
  it('should render card container', () => {
    const { container } = render(<InvitationCardSkeleton />);

    expect(container.querySelector('.bg-gray-50.rounded-lg')).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<InvitationCardSkeleton />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should use flexbox layout', () => {
    const { container } = render(<InvitationCardSkeleton />);

    expect(container.querySelector('.flex.items-center')).toBeInTheDocument();
  });

  it('should render multiple skeleton elements', () => {
    const { container } = render(<InvitationCardSkeleton />);

    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(2);
  });
});

describe('Skeleton Loaders - Visual Consistency', () => {
  it('all skeletons should use gray-200 color', () => {
    const { container: container1 } = render(<TaskCardSkeleton />);
    const { container: container2 } = render(<StatsCardSkeleton />);
    const { container: container3 } = render(<InvitationCardSkeleton />);

    expect(container1.querySelector('.bg-gray-200')).toBeInTheDocument();
    expect(container2.querySelector('.bg-gray-200')).toBeInTheDocument();
    expect(container3.querySelector('.bg-gray-200')).toBeInTheDocument();
  });

  it('all skeletons should have animate-pulse', () => {
    const { container: container1 } = render(<TaskCardSkeleton />);
    const { container: container2 } = render(<StatsCardSkeleton />);
    const { container: container3 } = render(<ActivityItemSkeleton />);

    expect(container1.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container2.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container3.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
