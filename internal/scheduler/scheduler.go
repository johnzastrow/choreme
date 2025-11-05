package scheduler

import (
	"context"
	"log"
	"time"

	"github.com/choreme/choreme/internal/service"
)

// Scheduler manages background jobs
type Scheduler struct {
	services *service.Services
	stopChan chan struct{}
}

// NewScheduler creates a new job scheduler
func NewScheduler(services *service.Services) *Scheduler {
	return &Scheduler{
		services: services,
		stopChan: make(chan struct{}),
	}
}

// Start begins running all scheduled jobs
func (s *Scheduler) Start() {
	log.Println("Starting background job scheduler...")

	// Start daily spending limit reset job (runs at midnight)
	go s.runDailySpendingLimitReset()

	// Start monthly interest accrual job (runs on 1st of each month at 1 AM)
	go s.runMonthlyInterestAccrual()

	log.Println("Background jobs started successfully")
}

// Stop gracefully stops all scheduled jobs
func (s *Scheduler) Stop() {
	log.Println("Stopping background job scheduler...")
	close(s.stopChan)
}

// runDailySpendingLimitReset resets spending limits daily at midnight
func (s *Scheduler) runDailySpendingLimitReset() {
	// Calculate time until next midnight
	now := time.Now()
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	durationUntilMidnight := nextMidnight.Sub(now)

	log.Printf("Daily spending limit reset scheduled for: %s (in %s)", nextMidnight.Format(time.RFC3339), durationUntilMidnight)

	// Wait until midnight
	select {
	case <-time.After(durationUntilMidnight):
		// Run immediately at midnight
		s.resetSpendingLimits()
	case <-s.stopChan:
		return
	}

	// Then run every 24 hours
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.resetSpendingLimits()
		case <-s.stopChan:
			return
		}
	}
}

// runMonthlyInterestAccrual accrues interest on the 1st of each month at 1 AM
func (s *Scheduler) runMonthlyInterestAccrual() {
	// Calculate time until next 1st of month at 1 AM
	now := time.Now()

	// Determine next month's first day
	year, month, _ := now.Date()
	if now.Day() >= 1 && now.Hour() >= 1 {
		// Already past 1st at 1 AM this month, schedule for next month
		if month == time.December {
			year++
			month = time.January
		} else {
			month++
		}
	}

	nextRun := time.Date(year, month, 1, 1, 0, 0, 0, now.Location())
	durationUntilNextRun := nextRun.Sub(now)

	log.Printf("Monthly interest accrual scheduled for: %s (in %s)", nextRun.Format(time.RFC3339), durationUntilNextRun)

	// Wait until first run
	select {
	case <-time.After(durationUntilNextRun):
		s.accrueInterest()
	case <-s.stopChan:
		return
	}

	// Then calculate and wait for subsequent months
	for {
		now = time.Now()
		year, month, _ = now.Date()

		// Schedule for next month's 1st at 1 AM
		if month == time.December {
			year++
			month = time.January
		} else {
			month++
		}

		nextRun = time.Date(year, month, 1, 1, 0, 0, 0, now.Location())
		durationUntilNextRun = nextRun.Sub(now)

		log.Printf("Next interest accrual scheduled for: %s (in %s)", nextRun.Format(time.RFC3339), durationUntilNextRun)

		select {
		case <-time.After(durationUntilNextRun):
			s.accrueInterest()
		case <-s.stopChan:
			return
		}
	}
}

// resetSpendingLimits performs the daily spending limit reset
func (s *Scheduler) resetSpendingLimits() {
	log.Println("Running daily spending limit reset job...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	err := s.services.Account.ResetAllSpendingLimits(ctx)
	if err != nil {
		log.Printf("ERROR: Failed to reset spending limits: %v", err)
		return
	}

	log.Println("Daily spending limit reset completed successfully")
}

// accrueInterest performs monthly interest accrual for all eligible users
func (s *Scheduler) accrueInterest() {
	log.Println("Running monthly interest accrual job...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	err := s.services.Account.AccrueInterest(ctx)
	if err != nil {
		log.Printf("ERROR: Failed to accrue interest: %v", err)
		return
	}

	log.Println("Monthly interest accrual completed successfully")
}

// RunOnce executes a job immediately (useful for testing or manual triggers)
func (s *Scheduler) RunOnce(jobName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	switch jobName {
	case "reset_spending_limits":
		return s.services.Account.ResetAllSpendingLimits(ctx)
	case "accrue_interest":
		return s.services.Account.AccrueInterest(ctx)
	default:
		log.Printf("Unknown job: %s", jobName)
		return nil
	}
}
