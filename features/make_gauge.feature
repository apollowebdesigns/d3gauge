Feature: Must render gauge on a page
  Scenario: gauge renders
    Given I have a gauge
    When I am on a page
    Then I see a gauge